package com.expense.categorizer.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ForwardController {
    @RequestMapping(value = "{path:^(?!api|static|index.html|error).*$}/**")
    public String forward() {
        return "forward:/index.html";
    }
}
