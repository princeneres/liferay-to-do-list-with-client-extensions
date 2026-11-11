package com.todolist;

import com.liferay.client.extension.util.spring.boot.ClientExtensionUtilSpringBootComponentScan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * @author Prince Neres
 */
@Import(ClientExtensionUtilSpringBootComponentScan.class)
@SpringBootApplication
public class ToDoListSpringBootApplication {

	public static void main(String[] args) {
		SpringApplication.run(ToDoListSpringBootApplication.class, args);
	}

}