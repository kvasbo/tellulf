//
//  ContentView.swift
//  tellulf-wrapper
//
//  Created by Audun Kvasbø on 15/10/2019.
//  Copyright © 2019 Audun Kvasbø. All rights reserved.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        WebView(url: "https://tellulf.kvasbo.no").edgesIgnoringSafeArea(.all)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView().padding(.top).previewDevice("iPad7,3")
    }
}
