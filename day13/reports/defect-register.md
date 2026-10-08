# Zynora Day 13 - Defect Register

## 1. Purpose

This defect register records the issues identified during Day 13 testing, the corrective actions taken, and the retest status.

## 2. Defect Summary

| ID | Area | Defect | Severity | Fix | Retest Status |
|---|---|---|---|---|---|
| D13-001 | RAG Grounding | Zynora grounding-source question was not correctly handled | Medium | Updated RAG intent and grounding logic | PASS |
| D13-002 | Context Retrieval | Franchise follow-up context was not reliably identified | Medium | Improved context intent inference | PASS |
| D13-003 | Source Follow-up | Source-related follow-up question required improved retrieval handling | Medium | Added source follow-up handling | PASS |
| D13-004 | Knowledge Boundary | Unsupported employee salary information required strict fallback | High | Added unsupported-information boundary rules | PASS |
| D13-005 | Ambiguity | Ambiguous structure question could retrieve unsupported information | Medium | Added ambiguity detection and clarification response | PASS |
| D13-006 | Ambiguity | Standalone "What services?" required clarification instead of unsupported retrieval | Medium | Added standalone ambiguity handling | PASS |
| D13-007 | Prompt Injection | Malicious instructions could attempt to bypass the approved RAG boundary | High | Added prompt-injection detection middleware | PASS |
| D13-008 | Monitoring | Conversation ID was not initially persisted in system logs | Medium | Updated request logging integration | PASS |
| D13-009 | Regression Evaluator | Evaluator produced false failures for grounded answers | Medium | Updated evaluator to use source, category, groundedness and semantic intent | PASS |

## 3. Security Defects

Security-related testing verified protection against:

- Instruction override attempts
- External search requests
- System prompt extraction
- Other-user conversation access
- RAG restriction bypass attempts

All five adversarial security tests passed after the security middleware was implemented.

## 4. Monitoring Fix

The monitoring system was updated to record:

- User
- Conversation ID
- Question
- Retrieval status
- Source
- Response time
- Error status

A live Zynora request was used to verify that the conversation ID and retrieval information were correctly persisted in the monitoring logs.

## 5. Regression Verification

After all identified fixes were implemented, the complete 40-question regression dataset was executed again.

Result:

- Total: 40
- Passed: 40
- Failed: 0
- Partial: 0
- Pass Rate: 100%

## 6. Final Defect Status

All defects identified during Day 13 testing were fixed and successfully retested.

Open Critical Defects: 0

Open High Defects: 0

Open Medium Defects: 0

Open Low Defects: 0

Overall Defect Status: CLOSED

## 7. Conclusion

The Day 13 defect cycle was completed successfully.

Each identified issue was reproduced or evaluated, corrected, and included in regression testing. The final regression result of 40/40 passed confirms that the implemented fixes did not introduce failures into the tested Zynora functionality.
