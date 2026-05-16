package com.fixall.fixallfrontend.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardingController {

    @RequestMapping({
            "/",
            "/login",
            "/register",
            "/client",
            "/client/request/new",
            "/professional",
            "/profile"
    })
    public String forwardRootRoutes() {
        return "forward:/index.html";
    }
//
    @RequestMapping("/{path:^(?!api$).*$}/{subPath:[^.]*}")
    public String forwardNestedRoutes() {
        return "forward:/index.html";
    }
}

