# LLM-as-Judge Template

Pattern for evaluating AI agent outputs using GPT-5 as a judge.

## Core Concept

Use a powerful LLM (GPT-5) to evaluate agent outputs against expected results and success criteria. The judge provides:
- Numerical scores across multiple dimensions
- Reasoning for each score
- Pass/fail determination
- Actionable feedback for improvement

## Judge Prompt Template

```typescript
const judgePrompt = `You are evaluating an AI agent's response against expected output and success criteria.

**Expected Output:**
\`\`\`
${JSON.stringify(expectedOutput, null, 2)}
\`\`\`

**Actual Agent Output:**
\`\`\`
${JSON.stringify(actualOutput, null, 2)}
\`\`\`

**Success Criteria:**
${successCriteria}

${mcpCallsExpected ? `**Expected Tool/MCP Calls:**\n${mcpCallsExpected.join(', ')}` : ''}

**Evaluation Dimensions:**
Evaluate the agent's response on a scale of 1-5 for each criterion:

1. **Accuracy** (1-5): Does the output match the expected result semantically?
   - 5: Perfect match or equivalent
   - 4: Minor differences that don't affect correctness
   - 3: Some inaccuracies but core content is correct
   - 2: Significant inaccuracies
   - 1: Completely incorrect

2. **Completeness** (1-5): Are all required elements present?
   - 5: All elements present and complete
   - 4: One minor element missing
   - 3: Some elements missing but core is there
   - 2: Many elements missing
   - 1: Mostly incomplete

3. **Format Compliance** (1-5): Does output follow the required format/schema?
   - 5: Perfect format compliance
   - 4: Minor formatting issues
   - 3: Format mostly correct
   - 2: Significant format deviations
   - 1: Wrong format entirely

4. **Scope Adherence** (1-5): Did the agent stay within its defined scope?
   - 5: Perfectly within scope
   - 4: Slight scope expansion but appropriate
   - 3: Minor scope violations
   - 2: Significant scope violations
   - 1: Completely out of scope

5. **Context Usage** (1-5): Did the agent properly use the injected context?
   - 5: Perfect use of all relevant context
   - 4: Good use of context, minor omissions
   - 3: Some context used, some ignored
   - 2: Context largely ignored
   - 1: Context not used at all

${mcpCallsExpected ? `
6. **Tool/MCP Usage** (1-5): Did the agent call the correct tools/MCPs?
   - 5: Perfect tool usage
   - 4: Correct tools, minor usage issues
   - 3: Some correct tools used
   - 2: Wrong tools or poor usage
   - 1: No tools used or completely wrong
` : ''}

**Overall Assessment:**
- Calculate overall score as average of all dimensions
- Determine PASS/FAIL: Pass if overall score >= 3.5
- Provide detailed reasoning for each score

**Output Format:**
Respond with valid JSON matching this structure:
\`\`\`json
{
  "overall_score": number,
  "accuracy": number,
  "completeness": number,
  "format_compliance": number,
  "scope_adherence": number,
  "context_usage": number,
  ${mcpCallsExpected ? '"mcp_usage_correct": number,' : ''}
  "reasoning": "Detailed explanation of scores, highlighting strengths and weaknesses",
  "pass": boolean,
  "improvement_suggestions": "Specific suggestions for improving the agent's prompt or behavior"
}
\`\`\`
`;
```

## Implementation Pattern

### TypeScript Implementation

```typescript
import OpenAI from 'openai';

interface JudgeResult {
  overall_score: number;
  accuracy: number;
  completeness: number;
  format_compliance: number;
  scope_adherence: number;
  context_usage: number;
  mcp_usage_correct?: number;
  reasoning: string;
  pass: boolean;
  improvement_suggestions?: string;
}

async function judgeResponse(
  expected: any,
  actual: any,
  criteria: string,
  mcpCallsExpected?: string[]
): Promise<JudgeResult> {
  const openai = new OpenAI();

  const judgePrompt = `[Use template above]`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",  // or "gpt-5" for more thorough evaluation
    messages: [{ role: "user", content: judgePrompt }],
    response_format: { type: "json_object" }  // Ensures JSON output
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

## Validation Dataset Format

```json
{
  "examples": [
    {
      "id": "example_1",
      "description": "Happy path test",
      "input": "User query or structured input",
      "context": {
        "user_id": "123",
        "additional_data": "..."
      },
      "expected_output": "Expected text response or JSON object",
      "success_criteria": "Detailed criteria: Must include X, Y, Z. Should use context data. Must stay within scope.",
      "tags": ["happy_path", "context_usage"],
      "mcp_calls_expected": ["mcp__postgres__query"]
    }
  ]
}
```

## Test Runner Pattern

```typescript
import * as fs from 'fs';
import { runWorkflow } from './agent';

interface ValidationExample {
  id: string;
  description?: string;
  input: string | object;
  context: any;
  expected_output: string | object;
  success_criteria: string;
  tags: string[];
  mcp_calls_expected?: string[];
}

async function runTests() {
  // Load validation dataset
  const dataset: { examples: ValidationExample[] } = JSON.parse(
    fs.readFileSync('./validation-dataset.json', 'utf-8')
  );

  const results: Array<{
    example: ValidationExample;
    actual_output: any;
    judge_result: JudgeResult;
  }> = [];

  console.log(`Running ${dataset.examples.length} tests...\n`);

  // Run each test
  for (const example of dataset.examples) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${example.id}`);
    console.log(`Description: ${example.description || 'N/A'}`);
    console.log(`Tags: ${example.tags.join(', ')}`);
    console.log('='.repeat(60));

    // Execute agent
    const agentResult = await runWorkflow({
      input_as_text: typeof example.input === 'string'
        ? example.input
        : JSON.stringify(example.input),
      context_data: example.context,
      session_id: `test_${example.id}`
    });

    // Judge response
    const judgeResult = await judgeResponse(
      example.expected_output,
      agentResult.output_text,
      example.success_criteria,
      example.mcp_calls_expected
    );

    results.push({
      example,
      actual_output: agentResult.output_text,
      judge_result: judgeResult
    });

    // Display result
    console.log(`\n📊 Scores:`);
    console.log(`   Overall: ${judgeResult.overall_score.toFixed(2)}/5`);
    console.log(`   Accuracy: ${judgeResult.accuracy}/5`);
    console.log(`   Completeness: ${judgeResult.completeness}/5`);
    console.log(`   Format: ${judgeResult.format_compliance}/5`);
    console.log(`   Scope: ${judgeResult.scope_adherence}/5`);
    console.log(`   Context: ${judgeResult.context_usage}/5`);
    if (judgeResult.mcp_usage_correct !== undefined) {
      console.log(`   Tool Usage: ${judgeResult.mcp_usage_correct}/5`);
    }
    console.log(`\n${judgeResult.pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`\n💭 Reasoning:\n${judgeResult.reasoning}`);
    if (judgeResult.improvement_suggestions) {
      console.log(`\n💡 Suggestions:\n${judgeResult.improvement_suggestions}`);
    }
  }

  // Summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passCount = results.filter(r => r.judge_result.pass).length;
  const totalCount = results.length;
  const passRate = (passCount / totalCount) * 100;
  const avgScore = results.reduce((sum, r) => sum + r.judge_result.overall_score, 0) / totalCount;

  console.log(`\n📈 Results:`);
  console.log(`   Passed: ${passCount}/${totalCount} (${passRate.toFixed(1)}%)`);
  console.log(`   Average Score: ${avgScore.toFixed(2)}/5`);

  // Tag analysis
  const tagResults = new Map<string, { pass: number; total: number }>();
  for (const result of results) {
    for (const tag of result.example.tags) {
      const current = tagResults.get(tag) || { pass: 0, total: 0 };
      current.total++;
      if (result.judge_result.pass) current.pass++;
      tagResults.set(tag, current);
    }
  }

  console.log(`\n📊 By Tag:`);
  for (const [tag, stats] of tagResults) {
    const rate = (stats.pass / stats.total) * 100;
    console.log(`   ${tag}: ${stats.pass}/${stats.total} (${rate.toFixed(1)}%)`);
  }

  // Failed tests
  const failed = results.filter(r => !r.judge_result.pass);
  if (failed.length > 0) {
    console.log(`\n❌ Failed Tests:`);
    for (const fail of failed) {
      console.log(`   - ${fail.example.id}: Score ${fail.judge_result.overall_score.toFixed(2)}/5`);
      console.log(`     ${fail.judge_result.reasoning.substring(0, 100)}...`);
    }
  }

  // Save detailed report
  const report = {
    summary: {
      total: totalCount,
      passed: passCount,
      failed: totalCount - passCount,
      pass_rate: passRate,
      average_score: avgScore
    },
    by_tag: Object.fromEntries(tagResults),
    detailed_results: results.map(r => ({
      id: r.example.id,
      tags: r.example.tags,
      input: r.example.input,
      expected: r.example.expected_output,
      actual: r.actual_output,
      scores: {
        overall: r.judge_result.overall_score,
        accuracy: r.judge_result.accuracy,
        completeness: r.judge_result.completeness,
        format_compliance: r.judge_result.format_compliance,
        scope_adherence: r.judge_result.scope_adherence,
        context_usage: r.judge_result.context_usage,
        mcp_usage: r.judge_result.mcp_usage_correct
      },
      pass: r.judge_result.pass,
      reasoning: r.judge_result.reasoning,
      suggestions: r.judge_result.improvement_suggestions
    }))
  };

  fs.writeFileSync('./test-report.json', JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: test-report.json`);

  // Return summary
  return {
    passRate,
    avgScore,
    passed: passCount,
    total: totalCount
  };
}

// Run tests
if (require.main === module) {
  runTests()
    .then(summary => {
      console.log(`\n✅ Testing complete!`);
      process.exit(summary.passRate >= 80 ? 0 : 1);  // Exit with error if < 80% pass rate
    })
    .catch(error => {
      console.error('\n❌ Testing failed:', error);
      process.exit(1);
    });
}
```

## Evaluation Criteria Guidelines

### Writing Good Success Criteria

Good success criteria are:
- **Specific**: Clear, measurable expectations
- **Comprehensive**: Cover all important aspects
- **Realistic**: Achievable by a well-designed agent
- **Context-aware**: Reference the specific example's context

**Example - Good:**
```
Must generate a workout plan containing:
- 5-7 exercises targeting leg muscles
- Each exercise with sets × reps format (e.g., "3 × 10")
- Uses only equipment from context (barbell, dumbbells)
- Matches user's intermediate fitness level from context
- Includes warm-up and cool-down sections
- Does NOT include upper body exercises (scope violation)
```

**Example - Bad:**
```
Should provide a good workout
```

### Score Interpretation

| Score | Meaning | Action |
|-------|---------|--------|
| 5 | Excellent | No changes needed |
| 4 | Good | Minor improvements possible |
| 3 | Acceptable | Some improvements needed |
| 2 | Poor | Significant prompt revision needed |
| 1 | Failing | Major redesign required |

### Pass Threshold

**Recommended: Overall score >= 3.5**

This allows some imperfection while ensuring reasonable quality. Adjust based on your requirements:
- **Strict** (>= 4.0): Production-critical agents
- **Standard** (>= 3.5): Most use cases
- **Lenient** (>= 3.0): Early development

## Tips for Effective Judging

1. **Use multiple examples per category** - Test happy paths, edge cases, and failure modes
2. **Include scope violation tests** - Ensure agent rejects out-of-scope requests
3. **Test context usage explicitly** - Examples should require using context data
4. **Tag examples by type** - Enables analysis of which scenarios fail most
5. **Review judge reasoning** - Judge's explanations help improve prompts
6. **Iterate based on failures** - Failed tests reveal prompt weaknesses
7. **Track score trends** - Monitor if changes improve or degrade performance

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Judge too lenient | Success criteria too vague | Make criteria more specific and measurable |
| Judge too strict | Unrealistic expectations | Relax criteria or improve agent capability |
| Inconsistent scoring | Judge prompt ambiguous | Clarify scoring rubric with examples |
| Low accuracy scores | Agent not following instructions | Strengthen system prompt guidelines |
| Low scope scores | Scope boundaries unclear | Add explicit scope examples to system prompt |
| Low context scores | Agent ignoring context | Emphasize context usage in system prompt |
