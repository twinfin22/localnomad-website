# Workflow and review record

## Candidate research

Record the evidence for each candidate: first-party performance data when available, external reader questions, overlap with existing posts, age or factual-update need, and further reporting needed. Do not call an unmeasured search-volume estimate a fact.

## Draft or update

Use the actual category/tag enums in `lib/blog/schema.ts`. New posts are drafts unless publication is explicitly approved. Existing posts retain their URL and `date`; verified updates set `updatedAt`.

Keep the following report fields together per article:

```json
{
  "executionId": "run-...",
  "articleId": "locale/category/slug",
  "contentSha256": "...",
  "review": "facts|seo|voice|technical|legal",
  "result": "PASS|FAIL",
  "reviewedAt": "ISO-8601"
}
```

Run only the review layers affected by a change again, then record the final hash. Do not reuse reports from another article, run, or earlier text revision.

## Publication preparation

Prepare the MDX, source table, image candidate details, and a review summary. Treat an approval as invalid if the article hash changes afterwards. Actual publication remains a separate approval step.
