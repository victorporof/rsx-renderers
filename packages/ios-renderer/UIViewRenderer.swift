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

import Foundation
import SwiftyJSON

extension UIImageView {

    func setImageFromURL(url: String) {
        if let url = NSURL(string: url) {
            if let data = NSData(contentsOf: url as URL) {
                self.image = UIImage(data: data as Data)
            }
        }
    }
}

class UITextViewFixed: UITextView {

    override func layoutSubviews() {
        super.layoutSubviews()
        textContainerInset = UIEdgeInsets.zero
        textContainer.lineFragmentPadding = 0
    }
}

class UIViewRenderer {
    var view: UIView

    init(deviceWidth: Float, deviceHeight: Float, backgroundColor: UIColor = UIColor.white) {
        self.view = UIView(frame: CGRect(x: 0.0, y: 0.0, width: CGFloat(deviceWidth), height: CGFloat(deviceHeight)))
        self.view.backgroundColor = backgroundColor
    }

    func mount(parentView: UIView) {
        parentView.addSubview(self.view)
    }

    func draw(displayList: JSON) {
        for subview in self.view.subviews {
            subview.removeFromSuperview()
        }

        for (_,item): (String, JSON) in displayList {
            if item["type"] == "Rectangle" {
                let color = item["display"]["color"].arrayValue.map { CGFloat($0.float!) }
                let rect = item["rect"].dictionaryValue.mapValues { CGFloat($0.float!) }

                let view = UIView(frame: CGRect(x: rect["left"]!, y: rect["top"]!, width: rect["width"]!, height: rect["height"]!))
                view.backgroundColor = UIColor(red: color[0], green: color[1], blue: color[2], alpha: color[3])

                self.view.addSubview(view)
            }
            else if item["type"] == "Border" {
                let tcolor = item["display"]["colors"][0].arrayValue.map { CGFloat($0.float!) }
                let rcolor = item["display"]["colors"][1].arrayValue.map { CGFloat($0.float!) }
                let bcolor = item["display"]["colors"][2].arrayValue.map { CGFloat($0.float!) }
                let lcolor = item["display"]["colors"][3].arrayValue.map { CGFloat($0.float!) }
                let widths = item["display"]["widths"].arrayValue.map { (value: JSON) -> CGFloat in if let v = value.float { return CGFloat(v) } else { return 0.0 } }
                let rect = item["rect"].dictionaryValue.mapValues { CGFloat($0.float!) }

                let topView = UIView(frame: CGRect(x: rect["left"]!, y: rect["top"]!, width: rect["width"]!, height: widths[0]))
                topView.backgroundColor = UIColor(red: tcolor[0], green: tcolor[1], blue: tcolor[2], alpha: tcolor[3])

                let rightView = UIView(frame: CGRect(x: rect["left"]! + rect["width"]!, y: rect["top"]!, width: widths[1], height: rect["height"]!))
                rightView.backgroundColor = UIColor(red: rcolor[0], green: rcolor[1], blue: rcolor[2], alpha: rcolor[3])

                let bottomView = UIView(frame: CGRect(x: rect["left"]!, y: rect["top"]! + rect["height"]!, width: rect["width"]!, height: widths[2]))
                bottomView.backgroundColor = UIColor(red: bcolor[0], green: bcolor[1], blue: bcolor[2], alpha: bcolor[3])

                let leftView = UIView(frame: CGRect(x: rect["left"]!, y: rect["top"]!, width: widths[3], height: rect["height"]!))
                leftView.backgroundColor = UIColor(red: lcolor[0], green: lcolor[1], blue: lcolor[2], alpha: lcolor[3])

                self.view.addSubview(topView)
                self.view.addSubview(rightView)
                self.view.addSubview(bottomView)
                self.view.addSubview(leftView)
            }
            else if item["type"] == "Image" {
                let src = item["display"]["src"].stringValue
                let rect = item["rect"].dictionaryValue.mapValues { CGFloat($0.float!) }

                let imageView = UIImageView(frame: CGRect(x: rect["left"]!, y: rect["top"]!, width: rect["width"]!, height: rect["height"]!))
                imageView.setImageFromURL(url: src)

                self.view.addSubview(imageView)
            }
            else if item["type"] == "Text" {
                let color = item["display"]["color"].arrayValue.map { CGFloat($0.float!) }
                let text = item["display"]["text"].stringValue
                let rect = item["rect"].dictionaryValue.mapValues { CGFloat($0.float!) }

                let textView = UITextViewFixed(frame: CGRect(x: rect["left"]!, y: rect["top"]!, width: rect["width"]!, height: rect["height"]!))
                textView.text = text
                textView.textColor = UIColor(red: color[0], green: color[1], blue: color[2], alpha: color[3])
                textView.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0)


                self.view.addSubview(textView)
            }
        }
    }
}

