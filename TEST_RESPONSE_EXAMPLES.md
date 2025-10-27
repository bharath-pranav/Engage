# Test Response Examples

This file contains sample responses for testing the frontend's response parsing capabilities.

## Test Case 1: Direct Response Format (Current API)

**Description:** Test the most common response format from Lambda URL

**Input:**
```json
{
  "status": "success",
  "requestId": "engage-20251027120433",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Based on the survey data analysis, here's how the managers' teams are performing:\n\n1. NoahAlbatross: Best overall performance (65.79%)\n   - Strengths: Motivation (90%), timely information from superiors (100%), growth opportunities (90%)\n   - Areas for improvement: Commitment to organization success (40%)\n\n2. csv: Second-best overall performance (60.77%)\n   - Strengths: Consistent performance across most areas\n   - Areas for improvement: No standout high scores, but no significant low scores either\n\n3. Lia Skylark: Third-best overall performance (59.47%)\n   - Strengths: Comfortable expressing opinions (100%), effective workload management (90%)\n   - Areas for improvement: Commitment to organization success (20%), motivation (30%)\n\n4. KimSparrow: Lowest overall performance (54.21%)\n   - Strengths: Commitment to organization success (70%), open communication channels (70%)\n   - Areas for improvement: Team communication (30%), recognition (30%), regular feedback (20%)\n\nWhile NoahAlbatross's team is performing the best overall, each manager's team has its own strengths and areas for improvement. To enhance overall employee performance, focus on improving growth opportunities, timely communication, and regular feedback, as these have the strongest impact on overall scores.",
  "metadata": {
    "tokenUsage": {
      "prompt": 0,
      "completion": 0,
      "total": 0
    },
    "actionGroupsInvoked": [
      "engage_analysis_report"
    ],
    "surveyDataUrl": "https://s3.amazonaws.com/static.engagesparrow.com/engage-sentiment-updated.json",
    "originalQuestion": "which team is better",
    "enhancedQuestion": "Please analyze the survey data from this URL: https://s3.amazonaws.com/static.engagesparrow.com/engage-sentiment-updated.json\n\nAs default always try to go with question based analysis for drive_by and scoreby as percentageScore.\n\nIf user asks for a change then go with different options.\n\nUser Question: tell me under which manager employees are performing better\n\nPlease use the survey analysis tools to provide insights based on the data from the above URL. Focus on providing specific, data-driven answers to the user's question."
  }
}
```

**Expected Behavior:**
- ✅ Response parsed successfully
- ✅ Manager names highlighted in teal
- ✅ Percentages color-coded (65.79%, 60.77%, 59.47%, 54.21%)
- ✅ Nested bullets properly indented
- ✅ sessionId extracted: "550e8400-e29b-41d4-a716-446655440000"

## Test Case 2: Wrapped Response Format (API Gateway)

**Description:** Test backward compatibility with wrapped responses

**Input:**
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
  },
  "body": {
    "status": "success",
    "requestId": "req-123",
    "sessionId": "test-session-456",
    "response": "Survey analysis complete:\n\n1. Manager A: Excellent performance (85%)\n   - Strengths: Leadership (95%)\n   - Areas for improvement: Technical skills (70%)",
    "metadata": {
      "tokenUsage": { "prompt": 100, "completion": 200, "total": 300 },
      "actionGroupsInvoked": ["engage_analysis_report"],
      "surveyDataUrl": "https://s3.amazonaws.com/static.engagesparrow.com/engage-sentiment-updated.json",
      "originalQuestion": "test question",
      "enhancedQuestion": "enhanced test question"
    }
  }
}
```

**Expected Behavior:**
- ✅ Response parsed successfully from wrapped format
- ✅ Body extracted and parsed correctly
- ✅ Manager A highlighted in teal
- ✅ 85% shown in green, 95% shown in green, 70% shown in yellow
- ✅ sessionId extracted: "test-session-456"

## Test Case 3: Wrapped Response with Stringified Body

**Description:** Test handling of body as JSON string

**Input:**
```json
{
  "statusCode": 200,
  "headers": { ... },
  "body": "{\"status\":\"success\",\"sessionId\":\"str-session-789\",\"response\":\"Test response\",\"metadata\":{\"tokenUsage\":{\"prompt\":0,\"completion\":0,\"total\":0},\"actionGroupsInvoked\":[],\"surveyDataUrl\":\"https://example.com\",\"originalQuestion\":\"test\",\"enhancedQuestion\":\"test\"}}"
}
```

**Expected Behavior:**
- ✅ JSON.parse() called on body string
- ✅ Response parsed successfully
- ✅ sessionId extracted: "str-session-789"

## Test Case 4: Error Response

**Description:** Test error handling

**Input:**
```json
{
  "status": "error",
  "message": "Invalid request"
}
```

**Expected Behavior:**
- ❌ Throws error: "Failed to get response from engage agent"
- ✅ User sees friendly error message

## Test Case 5: High Percentage Values

**Description:** Test color coding for excellent performance

**Input:**
```json
{
  "status": "success",
  "sessionId": "test-high",
  "response": "Performance metrics:\n\n1. TeamLead: Outstanding results (95%)\n   - Engagement score (98%)\n   - Satisfaction (92%)\n   - Communication (88%)",
  "metadata": { ... }
}
```

**Expected Behavior:**
- ✅ 95% shown in green
- ✅ 98% shown in green
- ✅ 92% shown in green
- ✅ 88% shown in green

## Test Case 6: Low Percentage Values

**Description:** Test color coding for poor performance

**Input:**
```json
{
  "status": "success",
  "sessionId": "test-low",
  "response": "Performance concerns:\n\n1. TeamB: Needs improvement (35%)\n   - Morale (28%)\n   - Productivity (42%)\n   - Retention (52%)",
  "metadata": { ... }
}
```

**Expected Behavior:**
- ✅ 35% shown in red
- ✅ 28% shown in red
- ✅ 42% shown in yellow
- ✅ 52% shown in yellow

## Test Case 7: Complex Nested Structure

**Description:** Test deep nesting and multiple indentation levels

**Input:**
```json
{
  "status": "success",
  "sessionId": "test-nested",
  "response": "Analysis:\n\n1. Department A: Strong (75%)\n   - Team 1 (80%)\n     - Metric A: Excellent (90%)\n     - Metric B: Good (70%)\n   - Team 2 (70%)\n     - Metric A: Needs work (45%)\n     - Metric B: Good (65%)",
  "metadata": { ... }
}
```

**Expected Behavior:**
- ✅ Multiple indentation levels rendered correctly
- ✅ All percentages color-coded appropriately
- ✅ Visual hierarchy maintained

## Test Case 8: No requestId Provided

**Description:** Test optional requestId field

**Input:**
```json
{
  "status": "success",
  "sessionId": "test-no-reqid",
  "response": "Basic response",
  "metadata": { ... }
}
```

**Expected Behavior:**
- ✅ Response parsed successfully
- ✅ No error for missing requestId
- ✅ sessionId extracted correctly

## Testing Checklist

### Parsing Tests
- [ ] Direct response format parsed correctly
- [ ] Wrapped response format parsed correctly
- [ ] Stringified body handled correctly
- [ ] Error responses throw appropriate errors

### Visual Tests
- [ ] Manager names highlighted in teal
- [ ] Green color for ≥80% percentages
- [ ] Blue color for ≥60% percentages
- [ ] Yellow color for ≥40% percentages
- [ ] Red color for <40% percentages

### Layout Tests
- [ ] Numbered lists rendered correctly
- [ ] Nested bullets indented properly
- [ ] Multiple levels of indentation work
- [ ] Section headers stand out

### Dark Mode Tests
- [ ] All colors readable in dark mode
- [ ] Text contrast sufficient
- [ ] Highlights visible

### Edge Cases
- [ ] Missing optional fields don't break parsing
- [ ] Empty response strings handled
- [ ] Very long responses don't break layout
- [ ] Special characters in manager names work

## Manual Testing Steps

1. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test direct response format**
   - Send a question to the chat
   - Verify manager names are highlighted
   - Check percentage color coding

3. **Test with browser DevTools**
   - Open Network tab
   - Send a question
   - Inspect the actual API response format
   - Verify it matches expected format

4. **Test dark mode**
   - Toggle dark mode
   - Verify all colors are readable
   - Check contrast ratios

5. **Test error scenarios**
   - Disconnect from internet
   - Verify error message displayed
   - Reconnect and verify recovery

6. **Test session continuity**
   - Send multiple questions
   - Verify sessionId persists
   - Check conversation context maintained

