---
title: "Assess real test coverage and improve the CI pipeline with mutation testing"
date: 2024-11-05T00:00:00Z
description: "Learn why line coverage is not enough and how to use Stryker.NET mutation testing in GitHub Actions to assess real test quality."
summary: "This guide explains the gap between code coverage and logic coverage, shows how mutation testing works with Stryker.NET, and demonstrates CI integration for pull request feedback."
draft: false
categories: [".NET", "Testing"]
tags: ["dotnet", "mutation-testing", "stryker", "test-coverage", "github-actions", "ci-cd"]
series: []
contributors: []
images: ["hero-lab.webp"]
canonicalURL: ""
toc: true
pinned: false
seo:
  title: "Real Test Coverage with Stryker.NET Mutation Testing"
  description: "Assess real test quality in .NET with Stryker.NET and automate mutation testing in GitHub Actions."
  canonical: ""
  noindex: false
---

Test coverage
-------------

Test coverage refers to the proportion of your codebase that is exercised by your tests. In simple terms, it’s like checking how much of your program’s instructions are actually being tested. If you imagine your code as a map, test coverage tells you which parts of that map your tests have explored and which parts they haven’t. It helps you understand how good your testing is and identifies areas of your code that might need more attention to ensure they’re functioning correctly.

Tests act as a safety net, ensuring that your logic remains intact and your code operates as intended. Especially beneficial in larger projects, they empower developers to confidently make assertions and continuously validate the functionality of their code. If the code base is validated and covered, we reduce the chance of encountering bugs. Also, it’s a good approach to always cover bugs that were found, to not face them again.

When it comes to assessing how good are your tests, and how much you can rely on them, the most common way is to calculate the test coverage. Code coverage is a measurement of how many lines/blocks/branches of your code are executed while the tests are running.

### How it’s calculated?

Test coverage tools work by instrumenting your code. This means they modify your code in some way to track its execution during testing. Here’s a basic overview of how it works:

1.  **Instrumentation:** The test coverage tool injects additional code, often in the form of counters or flags, into your source code. These additions allow the tool to monitor which parts of your code are executed during testing.
    Let’s say you have a simple C# method like this:

```
public int Add(int a, int b)
{
    return a + b;
}
```

When running tests it’s instrumented for test coverage, the code might be modified to something like this:

```
public int Add(int a, int b)
{
    // Instrumentation: Increment coverage counter for this line
    CoverageTracker.TrackLineExecution(1);
    return a + b;
}
```

The test coverage tool determines all code branches and injects codes like this.

2. **Execution**: When you run your tests, the instrumented code executes just like normal. However, as each line or block of code is executed, the added instrumentation tracks this activity.

3. **Data Collection:** The test coverage tool collects data on which parts of the code were executed during the test run. This data is typically recorded in a separate file or data structure.

4. **Analysis:** After the test run is complete, the coverage tool analyzes the collected data to determine which portions of the code were covered by the tests and which were not.

### Test coverage vs Logic coverage

Just because your code has covered lines doesn’t mean your tests are good enough. If you aim only for high coverage, you will end up with a covered project, but with a lot of potential bugs. That’s where unit tests and test-driven development (TDD) concepts come in. Writing tests shouldn’t just mirror the code (business unit ≠ Covered lines). For example, testing every ‘if’ statement for covering code branches isn’t enough. Tests need to cover different scenarios, not just code lines

In test-driven development, you start by writing tests based solely on requirements. Let’s say you’re testing a function to add two numbers. You focus on what the function should do — take two numbers and return their sum. It’s about testing the business logic, not just lines of code or branches.

Let’s take this example:

```
public bool IsPositive(int number)
{
    if (number >= 0 && number <= 100)
    {
        return true;
    }
    else
    {
        return false;
    }
}
```

and this test:

```
[Fact]
public void Positive_Number_Should_Return_true()
{
  var isPositive = Utilities.IsPositive(10);
    
  Assert.True(isPositive);
}
```

```csharp
[Fact]
public void Negative_Number_Should_Return_false()
{
  var isPositive = Utilities.IsPositive(-10);
    
  Assert.False(isPositive);
}
[Fact]
public void IsPositive_Method_Test()
{
  var isPositive = Utilities.IsPositive(-10);
    
  Assert.InRange(-10, int.MinValue, int.MaxValue);
}
```

We will get 100% test coverage, but there are problems with our implementation.

Your tests also need testing
----------------------------

For dotnet, there is a package called [Stryker.NET](https://stryker-mutator.io/docs/stryker-net/introduction/) which helps with testing your test methods.

### Stryker.NET and how it works

Stryker.NET is a mutation testing tool for .NET projects. Here’s how it typically works:

1.  **Mutation Generation:** Stryker.NET analyzes your .NET code and generates mutations. Mutations are small changes made to your source code, such as replacing a conditional operator (e.g., `<` becomes `<=`) or changing a method call to its negation (e.g., `!condition` becomes `condition`). Each mutation simulates a potential bug in your code.
    Let’s consider a simple C# method that calculates the factorial of a given number:

```
public int Factorial(int n)
{
    if (n <= 1)
    {
        return 1;
    }
    else
    {
        return n * Factorial(n - 1);
    }
}
```

Now, Stryker.NET might generate mutations by making small changes to this code. For example:

`Mutation 1:`

```
// Original: if (n <= 1)
// Mutation: if (n < 1)
public int Factorial(int n)
{
    if (n < 1)
    {
        return 1;
    }
    else
    {
        return n * Factorial(n - 1);
    }
}
```

`Mutation 2:`

```
// Original: return 1;
// Mutation: return 0;
public int Factorial(int n)
{
    if (n <= 1)
    {
        return 0;
    }
    else
    {
        return n * Factorial(n - 1);
    }
}
```

`Mutation 3:`

```
// Original: return n * Factorial(n - 1);
// Mutation: return n + Factorial(n - 1);
public int Factorial(int n)
{
    if (n <= 1)
    {
        return 1;
    }
    else
    {
        return n + Factorial(n - 1);
    }
}
```

These mutations simulate potential bugs in the original code. For example, Mutation 1 changes the condition `n <= 1` to `n < 1`, potentially causing incorrect behavior for negative input values. Mutation 2 changes the base case `return 1;` to `return 0;`, potentially affecting the result of the factorial calculation. Mutation 3 changes the multiplication operation to addition, potentially altering the factorial calculation logic.

2. **Test Execution:** After generating mutations, Stryker.NET runs your existing unit tests against these mutated versions of your code. It measures which mutations cause your tests to fail and which ones your tests successfully detect. Mutations that aren’t caught by your tests are considered “surviving mutations.”

3. **Mutation Score Calculation:** Based on the ratio of surviving mutations to total mutations, Stryker.NET calculates a mutation score. This score indicates the effectiveness of your unit tests in detecting changes to your code. A high mutation score suggests that your tests are robust and effective at catching bugs.

### How to use it?

First, we need to install a dotnet tool for the project.

```bash
dotnet new tool-manifest
dotnet tool install dotnet-stryker
```

Then simply run this command in the solution folder:

```
dotnet stryker --reporter "markdown"
```

Here are the results:

```text
# Mutation Testing Summary
| File         | Score  | Killed | Survived | Timeout | No Coverage | Ignored | Compile Errors | Total Detected | Total Undetected | Total Mutants |
| ------------ | ------ | ------ | -------- | ------- | ----------- | ------- | -------------- | -------------- | ---------------- | ------------- |
| Program.cs   | 0,00%  | 0      | 0        | 0       | 2           | 0       | 0              | 0              | 2                | 2             |
| Utilities.cs | 75,00% | 6      | 2        | 0       | 0           | 3       | 0              | 6              | 2                | 11            |

## The final mutation score is 60,00%
```

Improve the CI pipeline
-----------------------

Stryker seamlessly integrates into your continuous integration (CI) pipeline, enhancing your code quality checks. The results can then be reviewed in pull requests, providing developers with valuable insights into the effectiveness of their tests.

### CI implementation for GitHub Actions

Here is the GitHub action for it:

```yaml
name: Stryker.NET Mutation Testing
on:
  pull_request:
    branches: [main]
jobs:
  mutation-testing:
    permissions: write-all
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2
    - name: Setup .NET
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: '7.0.x'
    - name: Install dotnet tools
      working-directory: TestYourTest
      run: dotnet tool restore
    - name: Run Stryker.NET
      working-directory: TestYourTest/UnitTests
      run: dotnet stryker --reporter "markdown"
    - name: Find Markdown files recursively
      id: find-md-files
      run: |
        md_files=$(find ./TestYourTest/UnitTests -name "*.md")
        echo "::set-output name=md_files::${md_files}"
    - name: Post Stryker report as comment
      uses: actions/github-script@v5
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        script: |
          const fs = require('fs');
          const path = require('path');
          const mdFiles = "${{ steps.find-md-files.outputs.md_files }}".split("\n");
          let reportContent = "";
          mdFiles.forEach(file => {
            reportContent += fs.readFileSync(file, 'utf8') + '\n';
          });
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: reportContent
          })
```

Here’s an explanation of each section:

1. **Workflow Name and Trigger**
- `name`: Specifies the name of the workflow.
- `on.pull_request.branches`: Specifies that the workflow should be triggered on pull requests targeting the `main` branch.
2. **Job Configuration**
- `permissions: write-all`: Grants write permissions to the workflow, which might be required for certain actions or operations.
- `runs-on: ubuntu-latest`: Specifies that the job should run on an Ubuntu environment.
3. **Steps**
- `Checkout code`: Uses the `actions/checkout@v2` action to check out the repository's code.
- `Setup .NET`: Uses the `actions/setup-dotnet@v1` action to download and set up the .NET environment with the version `7.0.x`.
- `Install dotnet tools`: Installs dotnet tools in the specified working directory `TestYourTest` using the `dotnet tool restore` command.
- `Run Stryker.NET`: Executes Stryker.NET in the `TestYourTest/UnitTests` directory using the `dotnet stryker --reporter "markdown"` command to generate a mutation testing report in Markdown format.
- `Find Markdown files recursively`: Runs a shell script to find all Markdown files (`*.md`) recursively in the `TestYourTest/UnitTests` directory and sets the output variable `md_files` with the list of file paths.
- `Post Stryker report as comment`: Uses the `actions/github-script@v5` action to post the Stryker report as a comment on the pull request. It reads the content of each Markdown file found in the previous step and concatenates them to form the report content, which is then posted as a comment using the GitHub REST API.

And here is the final result on the PR: [https://github.com/gor8808/test-your-tests/pull/3](https://github.com/gor8808/test-your-tests/pull/3)

{{< img-caption src="stryker-pr-comment.webp" caption="Mutation testing report posted on a pull request." >}}

Conclusion
----------

In conclusion, ensuring the reliability and robustness of our code is paramount in modern software development. While traditional testing methods provide a solid foundation for quality assurance, they may not always uncover all bugs or edge cases. This is where mutation testing, exemplified by tools like Stryker.NET, emerges as a powerful ally.

Through the integration of mutation testing into our continuous integration pipelines, we empower developers to identify and address potential weaknesses in their tests early in the development process. This proactive approach not only enhances the reliability of our code but also fosters a culture of continuous improvement within our teams.

As we navigate the complexities of modern software development, embracing mutation testing as a complementary tool alongside traditional testing methodologies enables us to raise the bar for code quality and deliver more resilient software solutions to our users.

GitHub sample
-------------

[Here is the example project on Github](https://github.com/gor8808/test-your-tests/tree/main)
