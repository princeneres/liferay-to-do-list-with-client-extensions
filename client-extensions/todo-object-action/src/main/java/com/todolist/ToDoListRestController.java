package com.todolist;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.json.JSONObject;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * @author Prince Neres
 */
@RequestMapping("/object/action/task")
@RestController
public class ToDoListRestController extends BaseRestController {

	@PostMapping
	public ResponseEntity<String> post(
		@AuthenticationPrincipal Jwt jwt, @RequestBody String json) {

		log(jwt, _log, json);

		long taskId = new JSONObject(
			json
		).getLong(
			"classPK"
		);

		String integrationCode = String.format(
			"INT-%s-%d",
			LocalDate.now(
			).format(
				DateTimeFormatter.BASIC_ISO_DATE
			),
			taskId);

		WebClient.create(
			lxcDXPServerProtocol + "://" + lxcDXPMainDomain
		).patch(
		).uri(
			"/o/c/tasks/{taskId}", taskId
		).header(
			HttpHeaders.AUTHORIZATION, "Bearer " + jwt.getTokenValue()
		).contentType(
			MediaType.APPLICATION_JSON
		).bodyValue(
			new JSONObject(
			).put(
				"integrationCode", integrationCode
			).toString()
		).retrieve(
		).toBodilessEntity(
		).block();

		_log.info(
			"Task " + taskId + " received integration code " +
				integrationCode);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	private static final Log _log = LogFactory.getLog(
		ToDoListRestController.class);

}
