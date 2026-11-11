package com.todolist;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Prince Neres
 */
@RequestMapping("/ready")
@RestController
public class ReadyRestController extends BaseRestController {

	@GetMapping
	public String get() {
		return "READY";
	}

}