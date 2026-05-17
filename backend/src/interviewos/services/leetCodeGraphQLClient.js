const LEETCODE_GRAPHQL_URL = process.env.LEETCODE_GRAPHQL_URL || "https://leetcode.com/graphql";

const PROBLEMSET_QUESTION_LIST_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      frontendQuestionId: questionFrontendId
      title
      titleSlug
      difficulty
      paidOnly: isPaidOnly
      topicTags {
        name
        slug
      }
    }
  }
}
`.trim();

const QUESTION_DATA_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    topicTags {
      name
      slug
    }
    companyTagStats
    codeSnippets {
      lang
      langSlug
      code
    }
    sampleTestCase
    exampleTestcases
    metaData
    hints
    isPaidOnly
  }
}
`.trim();

const getDefaultHeaders = () => ({
    "content-type": "application/json",
    "origin": "https://leetcode.com",
    "referer": "https://leetcode.com/problemset/",
    "user-agent": "ThinkRank-InterviewOS/1.0"
});

const graphqlRequest = async (query, variables = {}) => {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`LeetCode GraphQL request failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const payload = await response.json();

    if (payload.errors?.length) {
        throw new Error(`LeetCode GraphQL error: ${payload.errors[0].message}`);
    }

    return payload.data;
};

const listQuestions = async ({ difficulty, limit = 50, skip = 0 } = {}) => {
    const filters = difficulty
        ? { difficulty: String(difficulty).toUpperCase() }
        : {};

    try {
        const data = await graphqlRequest(PROBLEMSET_QUESTION_LIST_QUERY, {
            categorySlug: "",
            limit,
            skip,
            filters
        });

        return data.problemsetQuestionList;
    } catch (error) {
        // Some LeetCode deployments are picky about filter shapes; fall back to unfiltered fetch.
        if (!difficulty) {
            throw error;
        }

        const fallback = await graphqlRequest(PROBLEMSET_QUESTION_LIST_QUERY, {
            categorySlug: "",
            limit,
            skip,
            filters: {}
        });

        const questions = (fallback.problemsetQuestionList?.questions || []).filter(
            (question) => String(question.difficulty || "").toLowerCase() === String(difficulty).toLowerCase()
        );

        return {
            total: questions.length,
            questions
        };
    }
};

const getQuestionDetails = async (titleSlug) => {
    const data = await graphqlRequest(QUESTION_DATA_QUERY, { titleSlug });
    return data.question;
};

module.exports = {
    LEETCODE_GRAPHQL_URL,
    listQuestions,
    getQuestionDetails
};
