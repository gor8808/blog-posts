---
title: "AI-Powered Validation in .NET: Introducing LLMValidator"
giscus_id: "llm-validator"
description: "Validate grammar, tone, and intent beyond regex. LLMValidator brings semantic validation to .NET 8+ with Microsoft.Extensions.AI and FluentValidation support. Open source."
lead: "Beyond Regex: Solving Semantic Validation in .NET APIs with Large Language Models."
summary: "LLMValidator is a .NET library that brings Large Language Models to your validation pipeline. Validate grammar, tone, and semantic meaning with Microsoft.Extensions.AI integration."
date: 2025-10-26T09:00:00+00:00
lastmod: 2025-10-26T09:00:00+00:00
draft: false
weight: 50
categories: ["AI", ".NET"]
tags: ["LLM", "Validation", "Microsoft.Extensions.AI", "C#"]
contributors: ["Gor Grigoryan"]
pinned: false
homepage: false
seo:
  title: "LLMValidator: AI-Powered Semantic Validation for .NET"
  description: "Use LLMs to validate grammar, tone, and intent in .NET APIs. LLMValidator integrates with Microsoft.Extensions.AI and FluentValidation. Open source library."
  canonical: ""
  noindex: false
images: ["cover.webp"]
---

Traditional validation has served us well for decades. Email formats, phone numbers, required fields — regex patterns and built-in validators handle these perfectly. But what happens when you need to validate that a business proposal sounds professional, or that user feedback doesn’t contain an inappropriate tone?

This is where traditional validation hits its limits, and where semantic validation becomes necessary.

## The Problem: When Traditional Validation Isn't Enough

Consider these real-world API validation scenarios:

```csharp
// Traditional validation works great here
[EmailAddress]
public string Email { get; set; }

[Required, StringLength(100)]
public string CompanyName { get; set; }

// But how do you validate these?
public string BusinessProposal { get; set; } // Must be professional tone
public string CustomerFeedback { get; set; } // Must not be abusive
public string ProductDescription { get; set; } // Must be accurate, not misleading
```

These requirements involve **context, meaning, and nuance** — things that regex simply cannot handle. You could try keyword filtering, but that approach quickly becomes brittle and maintenance-heavy.

## The Solution: Semantic Validation with Microsoft.Extensions.AI

Enter [**LLMValidator**](https://github.com/gor8808/LLMValidator), a .NET library (8.0+) that brings Large Language Models to your validation pipeline through Microsoft.Extensions.AI.

The creation of **Microsoft.Extensions.AI** enables a bunch of possibilities to integrate AI packages and bring AI to your code. It makes AI accessible for developers without needing to know infrastructure details or complex setup procedures.

**The result?** Developers can use the benefits of AI with just one line of code.

LLMValidator brings the power of Large Language Models (LLMs) to your validation workflows. It **complements** traditional validation by handling scenarios where regex and algorithmic validation fall short — like grammar, tone, meaning, and context.

LLMValidator is designed with performance and reliability in mind.

```bash
# Core library
dotnet add package LLMValidation

# FluentValidation integration
dotnet add package LLMValidation.FluentValidation
```

### Microsoft.Extensions.AI Integration

```csharp
// One line to add AI validation to your app
builder.Services.AddSingleton<IChatClient>(provider =>
    new OpenAIClient("api-key").AsChatClient("gpt-4"));

builder.Services.AddLLMValidator();
```

Microsoft.Extensions.AI provides built-in caching, telemetry, and provider abstraction — no custom infrastructure needed.

### LLM Validation Quality Variants

Not all validation scenarios are equal. A quick tone check for user comments needs different precision than legal compliance validation. LLMValidator addresses this with three quality variants, each optimized for different use cases:

```csharp
// Fast validation (speed-critical scenarios)
// Uses minimal prompts, optimized for high-throughput APIs
var fastResult = await validator.ValidateAsync(content, BusinessValidationPrompts.ToneCheck.Fast);

// Balanced validation (general use)
// Good accuracy with reasonable response times for most applications
var balancedResult = await validator.ValidateAsync(content, BusinessValidationPrompts.ToneCheck.Balanced);

// Accurate validation (compliance, legal)
// Comprehensive analysis for high-stakes content where precision matters
var accurateResult = await validator.ValidateAsync(content, BusinessValidationPrompts.ToneCheck.Accurate);
```

This tiered approach lets you optimize cost and performance based on business requirements — use Fast for user-generated content, Balanced for general business communications, and Accurate for compliance-critical scenarios.

### FluentValidation LLM Integration

For teams already using FluentValidation, LLMValidator provides seamless integration. You can mix traditional and semantic validation rules in the same validator class, maintaining your existing validation patterns:

```csharp
public class ProposalValidator : AbstractValidator<BusinessProposal>
{
    public ProposalValidator(ILLMValidator llmValidator)
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress(); // Traditional validation - fast and reliable

        RuleFor(x => x.Content)
            .MustBeValidLLMAsync(llmValidator, opt => // Semantic validation - for nuanced checks
            {
                opt.ValidationPrompt = "Check for professional tone and appropriate business language";
                opt.ClientModelName = "gpt-4";
                opt.MinConfidence = 0.8f;
            })
            .WithMessage("Business proposal must use professional language");

        RuleFor(x => x.Content)
            .MustHaveValidGrammar(llmValidator)
            .WithMessage("Business proposal must have valid grammar");
    }
}
```

This integration preserves FluentValidation’s declarative approach while extending it to handle semantic requirements that traditional validators cannot address.

## Performance and Cost Optimization

LLM calls can be expensive and slow. Microsoft.Extensions.AI addresses this with automatic caching — identical validation requests return cached results instantly, dramatically reducing both cost and response time:

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
});

builder.Services.AddSingleton<IChatClient>(provider =>
{
    var client = new OpenAIClient("api-key").AsChatClient("gpt-4");
    return client.UseDistributedCache(); // Automatic caching
});
```

Cache hits transform 500ms+ LLM calls into sub-millisecond responses. For applications with repeated validation patterns (like form submissions with similar content), this can reduce costs by 70–90%.

## LLM Confidence Thresholds

LLMs can express uncertainty about their validation decisions. LLMValidator captures this confidence and lets you set thresholds — validation fails if the model’s confidence is too low:

```csharp
// High-stakes validation: require 90% confidence
// For legal documents, compliance checks, or financial content
var criticalValidation = new LLMValidationOptions
{
    ValidationPrompt = "Check legal compliance",
    MinConfidence = 0.9f
};

// General validation: 70% confidence is sufficient
// For user comments, general business communications
var generalValidation = new LLMValidationOptions
{
    ValidationPrompt = "Check tone appropriateness",
    MinConfidence = 0.7f
};
```

This approach prevents false positives in critical scenarios while maintaining usability for general content validation.

## Multi-Model Strategy: Right Model for the Right Job

Different validation tasks have different requirements. Why use an expensive frontier model for simple tone checks when a smaller, faster model works just as well? LLMValidator supports multiple LLM providers simultaneously, letting you optimize for both performance and cost:

```csharp
// Register multiple models with different strengths
builder.Services.AddKeyedSingleton<IChatClient>("openai-gpt4", (provider, key) =>
    new OpenAIClient("openai-key").AsChatClient("gpt-4"));

builder.Services.AddKeyedSingleton<IChatClient>("claude-sonnet", (provider, key) =>
    new AnthropicClient("anthropic-key").AsChatClient("claude-3-sonnet"));

builder.Services.AddKeyedSingleton<IChatClient>("ollama-local", (provider, key) =>
    new OllamaApiClient(new Uri("http://localhost:11434")).AsChatClient("llama3"));

// Configure model-specific defaults
builder.Services.AddLLMValidator()
    .AddModelOption("openai-gpt4", opt => {
        opt.Temperature = 0.0f; // High precision for compliance
        opt.MinConfidence = 0.9f;
    })
    .AddModelOption("claude-sonnet", opt => {
        opt.Temperature = 0.1f; // Balanced for business content
        opt.MinConfidence = 0.8f;
    })
    .AddModelOption("ollama-local", opt => {
        opt.Temperature = 0.3f; // More permissive for general checks
        opt.MinConfidence = 0.6f;
    });
```

Now you can route validation requests to the most appropriate model:

```csharp
// Use GPT-4 for high-stakes legal validation
var legalResult = await validator.ValidateAsync(legalDocument, new LLMValidationOptions
{
    ValidationPrompt = "Check for regulatory compliance and legal accuracy",
    ClientModelName = "openai-gpt4"
});

// Use Claude for nuanced business communication analysis
var businessResult = await validator.ValidateAsync(proposal, new LLMValidationOptions
{
    ValidationPrompt = "Evaluate professional tone and business appropriateness",
    ClientModelName = "claude-sonnet"
});

// Use local Ollama for high-volume, basic sentiment checks
var sentimentResult = await validator.ValidateAsync(userComment, new LLMValidationOptions
{
    ValidationPrompt = "Check if this comment contains inappropriate content",
    ClientModelName = "ollama-local"
});
```

This approach delivers significant cost optimization — expensive models only handle complex validations, while simpler tasks use efficient local or smaller models. The result is a validation system that scales economically with your business requirements.

## Real-World Impact

LLMValidator addresses validation scenarios that previously required:

*   Manual content review processes
*   Complex rule engines with hundreds of edge cases
*   Custom ML model training and maintenance
*   Expensive third-party content moderation services

Instead, you get semantic validation with:

*   **One-line setup** through Microsoft.Extensions.AI
*   **Built-in caching and telemetry**
*   **Multiple LLM provider support** (OpenAI, Azure, Anthropic, local models)
*   **Production-ready performance** with quality variants and confidence scoring

## Getting Started

Requirements: .NET 8.0+ and any LLM provider supported by Microsoft.Extensions.AI.

```bash
dotnet add package LLMValidation
dotnet add package LLMValidation.FluentValidation
dotnet add package Microsoft.Extensions.AI.OpenAI
```

Complete documentation and examples can be found on the [GitHub repository](https://github.com/gor8808/LLMValidator).

## Conclusion

Semantic validation fills the gap where traditional validation falls short. By combining both approaches — traditional validation for structure and format, LLM validation for meaning and context — you can build more robust and user-friendly APIs.

LLMValidator makes this combination practical for production use, leveraging Microsoft.Extensions.AI to provide a simple, performant, and maintainable solution.

The result: validation that understands not just what your users typed, but what they meant.
