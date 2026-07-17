package com.expense.categorizer.service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatModel chatModel;

    private static final String SYSTEM_PROMPT = 
        "You are 'Antigravity Finance AI', a highly sophisticated personal financial assistant.\n" +
        "Your goal is to help the user understand their spending, search transactions, detect anomalies, and save money.\n" +
        "The current date is %s. Always calculate relative date ranges (like 'last week', 'this month', 'yesterday') based on this current date.\n\n" +
        "You have access to a tool named `queryTransactions` that allows you to search the user's transactions database.\n" +
        "Whenever the user asks a question about their transactions, spending, category totals, or anomalies, you MUST use the `queryTransactions` tool to fetch the relevant data. DO NOT make up or hallucinate any transactions.\n" +
        "If you query the tool and find no matching transactions, explain that politely.\n" +
        "Format your responses beautifully using Markdown. Use tables for transaction lists, bullet points for summaries, and highlight key figures (like amounts) in bold.";

    public String chat(String userMessage) {
        String systemInstruction = String.format(SYSTEM_PROMPT, LocalDate.now().toString());
        
        // We prompt the model with both the system instruction and user message
        Prompt prompt = new Prompt(
            List.of(
                new org.springframework.ai.chat.messages.SystemMessage(systemInstruction),
                new org.springframework.ai.chat.messages.UserMessage(userMessage)
            ),
            OpenAiChatOptions.builder()
                .withFunction("queryTransactions")
                .build()
        );

        try {
            ChatResponse response = chatModel.call(prompt);
            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getContent();
            }
            return "I received an empty response from the AI model.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error communicating with the AI service: " + e.getMessage() + 
                   ". Please check if your OPENAI_API_KEY environment variable is set correctly.";
        }
    }
}
