//
//  WebView.swift
//  tellulf-wrapper
//
//  Created by Audun Kvasbø on 15/10/2019.
//  Copyright © 2019 Audun Kvasbø. All rights reserved.
//

import SwiftUI
import WebKit
  
struct WebView : UIViewRepresentable {
      
    // let request: URLRequest
    let url: String
      
    func makeUIView(context: Context) -> WKWebView  {
        return WKWebView()
    }
      
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let req = URLRequest(url: URL(string: url)!);
        uiView.load(req)
    }
      
}

