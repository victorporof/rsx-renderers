/*
Copyright 2016 Mozilla
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
*/

use std::marker::PhantomData;
use std::rc::Rc;

use gleam::gl;
use glutin;
use rsx_shared::traits::{TRunner, TRuntime};
use webrender;
use webrender::api::{
    BuiltDisplayList,
    ColorF,
    DeviceUintPoint,
    DeviceUintRect,
    DeviceUintSize,
    DocumentId,
    LayoutSize,
    PipelineId,
    RenderApi,
    RenderNotifier,
    ResourceUpdates
};

use consts::{BACKGROUND, EPOCH, PRESERVE_FRAME_STATE};

pub struct Notifier(glutin::WindowProxy);
pub struct Runner<T>(PhantomData<T>);

impl RenderNotifier for Notifier {
    fn clone(&self) -> Box<RenderNotifier> {
        box Notifier(self.0.clone())
    }

    fn wake_up(&self) {
        self.0.wakeup_event_loop();
    }

    fn new_document_ready(&self, _: DocumentId, _: bool, _: bool) {
        self.wake_up();
    }
}

impl<T> TRunner for Runner<T>
where
    T: TRuntime<
        RootRendererAPI = Rc<RenderApi>,
        VirtualEventMetadata = (glutin::Event,),
        ReflowMetadata = (PipelineId, LayoutSize),
        BuiltDisplayList = BuiltDisplayList,
        ResourceUpdates = ResourceUpdates
    >
{
    type Runtime = T;

    fn run<F>(mut f: F)
    where
        F: FnMut(&<Self::Runtime as TRuntime>::RootRendererAPI) -> Self::Runtime
    {
        let window = glutin::WindowBuilder::new()
            .with_title("WebRender")
            .with_decorations(false)
            .with_gl(glutin::GlRequest::GlThenGles {
                opengl_version: (3, 2),
                opengles_version: (3, 0)
            })
            .build()
            .unwrap();

        unsafe {
            window.make_current().ok();
        }

        let (initial_width, initial_height) = window.get_inner_size_pixels().unwrap();
        let initial_device_pixel_ratio = window.hidpi_factor();
        let initial_framebuffer_size = DeviceUintSize::new(initial_width, initial_height);

        let (mut renderer, sender) = webrender::Renderer::new(
            match window.get_api() {
                glutin::Api::OpenGl => unsafe { gl::GlFns::load_with(|symbol| window.get_proc_address(symbol) as *const _) },
                glutin::Api::OpenGlEs => unsafe { gl::GlesFns::load_with(|symbol| window.get_proc_address(symbol) as *const _) },
                glutin::Api::WebGl => unimplemented!()
            },
            box Notifier(window.create_window_proxy()),
            webrender::RendererOptions {
                device_pixel_ratio: initial_device_pixel_ratio,
                ..Default::default()
            }
        ).unwrap();

        let api = Rc::new(sender.create_api());
        let document_id = api.add_document(initial_framebuffer_size, 0);
        let pipeline_id = PipelineId(0, 0);
        api.set_root_pipeline(document_id, pipeline_id);

        let mut runtime = f(&api);

        renderer.toggle_debug_flags(webrender::DebugFlags::PROFILER_DBG);
        renderer.toggle_debug_flags(webrender::DebugFlags::GPU_TIME_QUERIES | webrender::DebugFlags::GPU_SAMPLE_QUERIES);

        'event_loop: for event in window.wait_events() {
            let (current_width, current_height) = window.get_inner_size_pixels().unwrap();
            let current_device_pixel_ratio = window.hidpi_factor();
            let current_framebuffer_size = DeviceUintSize::new(current_width, current_height);
            let current_framebuffer_rect = DeviceUintRect::new(DeviceUintPoint::zero(), current_framebuffer_size);
            let current_layout_size = LayoutSize::new(
                current_width as f32 / current_device_pixel_ratio,
                current_height as f32 / current_device_pixel_ratio
            );

            let should_set_window_position = runtime.should_set_window_position();
            let should_set_window_size = runtime.should_set_window_size();

            if let Some(position) = should_set_window_position {
                window.set_position(position.0, position.1);
            }
            if let Some(size) = should_set_window_size {
                window.set_inner_size(size.0, size.1);
            }

            let mut should_redraw = runtime.should_redraw();

            let mut events = Vec::new();
            events.push(event);
            events.extend(window.poll_events());

            for event in events {
                if let glutin::Event::Closed = event {
                    break 'event_loop;
                }
                if runtime.handle_event((event,)) {
                    should_redraw = true;
                }
            }

            if should_redraw {
                api.set_window_parameters(
                    document_id,
                    current_framebuffer_size,
                    current_framebuffer_rect,
                    current_device_pixel_ratio
                );

                let current_resource_updates = runtime.take_resource_updates();
                let current_display_list = runtime.generate_display_list((pipeline_id, current_layout_size));

                api.set_display_list(
                    document_id,
                    EPOCH,
                    BACKGROUND,
                    current_layout_size,
                    (pipeline_id, current_layout_size, current_display_list),
                    PRESERVE_FRAME_STATE,
                    current_resource_updates
                );
            }

            api.generate_frame(document_id, None);

            renderer.update();
            renderer.render(current_framebuffer_size).unwrap();

            window.swap_buffers().ok();
        }

        renderer.deinit();
    }
}
