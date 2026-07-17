package com.expense.categorizer.controller;

import com.expense.categorizer.service.ChatService;
import com.expense.categorizer.context.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Allow React frontend to connect
public class ChatController {

    @Autowired
    private ChatService chatService;

    public record ChatRequest(String message) {}
    public record ChatResponse(String response) {}

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ChatRequest request
    ) {
        if (request.message() == null || request.message().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Message cannot be empty"));
        }
        
        try {
            UserContext.setUserId(userId);
            String reply = chatService.chat(request.message());
            return ResponseEntity.ok(new ChatResponse(reply));
        } finally {
            UserContext.clear();
        }
    }
}
