---
title: "Optimizing .NET Testing Workflow: Docker-in-Docker Testing with Testcontainers and Azure Pipelines"
date: 2024-02-18T00:00:00Z
description: "Learn how to run .NET integration tests with Testcontainers, Docker-in-Docker, and Azure Pipelines using a portable container-based workflow."
summary: "This guide covers integration testing with real services, Testcontainers setup in .NET, xUnit execution model, and CI implementation with Docker Compose in Azure Pipelines."
draft: false
categories: [".NET", "DevOps"]
tags: ["dotnet", "testcontainers", "docker", "integration-testing", "azure-pipelines", "xunit"]
series: []
contributors: []
images: ["hero-unsplash.webp"]
canonicalURL: ""
toc: true
pinned: false
seo:
  title: "Docker-in-Docker .NET Testing with Testcontainers"
  description: "Run reliable .NET integration tests with Testcontainers and Docker-in-Docker in Azure Pipelines."
  canonical: ""
  noindex: false
---

This article walks you through **each step**, offering a **detailed explanation** of key topics, including testing strategies, Docker, containers, and test containers (see all in the Table of Contents). The focus extends to establishing an integration test environment utilizing best practices from the ground up. Only once this foundation is in place will we dive into the problems and solutions of Docker-in-Docker, ensuring a thorough and structured exploration of the entire process. If you’re familiar with the discussed topics, feel free to navigate directly to the Docker-in-Docker section in the Table of Contents.

Introduction to the problem:
----------------------------

There are two primary testing approaches: unit and integration tests.

### Integration vs Unit tests:

While unit tests thrive on mocking dependent services to test individual units, integration tests use a different approach. To ensure that the flow works from start to end, we must run tests on fully operational services — real databases, storage, service buses, etc.

Consider the following scenario to understand this problem. This code snippet utilizes EF Core and PostgreSQL:

```
public async Task<User?> GetUserByName(string name)
{
    if (string.IsNullOrEmpty(name))
    {
        return null;
    }
    return await context.Users.FirstOrDefaultAsync(x =>
        x.Name.Equals(name, StringComparison.InvariantCultureIgnoreCase));
}
```

If we use tests with the common strategy of mocking the context it will succeed. However, it throws an exception during execution on the real database as it cannot translate the LINQ expression into SQL:

```
Unhandled exception. System.InvalidOperationException: The LINQ expression 'DbSet<User>()
    .Where(u => u.Name.Equals(
        value: name, 
        comparisonType: InvariantCultureIgnoreCase))' could not be translated. Additional information: Translation of the 'string.Equals' overload with a 'StringComparison' parameter is not supported. See https://go.microsoft.com/fwlink/?linkid=2129535 for more information. Either rewrite the query in a form that can be translated, or switch to client evaluation explicitly by inserting a call to 'AsEnumerable', 'AsAsyncEnumerable', 'ToList', or 'ToListAsync'. 
```

Another problem can occur because of the running PSQL version.

This complexity highlights why testing with real services is crucial. Some issues, like translation limitations, only show up in real-world settings. Additionally, there’s a risk of compatibility problems between your code and the running version in use (e.g. Postgres version as there can be functions that do not exist in the running version).

Dealing with these challenges encourages us to reconsider how we approach testing. It stresses the importance of thorough integration tests to ensure our code works well in real-world situations.

### Dedicated db for integration tests

The solution for integration tests is to connect to the test database and use it only for testing. In the company where I worked, we had a practice to have a Postgres server that would be used only for integration test databases. It means that there always must be some dedicated db that only is used for integration tests. And here are the cons that we have encountered:

The solution to those problems involves connecting to the test database for testing purposes. In my previous workplace, we implemented a strategy where a dedicated Postgres server was exclusively allocated for integration test databases. This practice comes with several drawbacks:

1.  **Cost and Resource Utilization:** The dedicated server requires continuous costs, even during periods of inactivity, leading to potential underutilization.
2.  **Maintenance Overhead:** Managing an additional database server means extra maintenance efforts. Updates, _backups_, and general upkeep can become more complex and time-consuming.
3.  **Synchronization Challenges:** To ensure the integrity of tests, the database needs to be reset for each testing cycle, requiring recreation. This process is important not only for proper test case execution but also for validating migrations and other related scenarios.

Due to these challenges, we decided to shift our approach and start using test containers.

TestContainers
--------------

Test containers operate by running the database through Docker, cleverly avoiding the need for additional resource allocation. Here’s how the scenario unfolds when comparing TestContainers to a dedicated database image.

### TestContainer vs dedicated db:

{{< img-caption src="testcontainers-vs-dedicated-db.webp" caption="TestContainers compared to a dedicated database setup." >}}

Instead of demanding fresh resources, TestContainers executes within the testing environment, be it your personal computer, a pipeline, or a similar setup. Basically `TestContainers` serves as an abstraction-level client for managing Docker containers within a .NET environment. It simplifies the process of interacting with Docker by offering a user-friendly wrapper around Docker commands. Consider a typical Docker command, like setting up a PostgreSQL container:

`Script:`

```
docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres:latest
```

`TestContainers:`

```
var containerBuilder = new ContainerBuilder<PostgresContainer>()
    .ConfigureDatabaseConfiguration("mysecretpassword")
    .ConfigurePortBinding(5432);
var postgresContainer = containerBuilder.Build();
await postgresContainer.StartAsync();
```

When a test starts, TestContainers dynamically sets up a containerized instance of the required service, such as a database, ensuring a clean and reproducible environment. These containers are configured based on the test’s needs, allowing flexibility in defining settings like database version, environment variables, etc. Once the test is completed, TestContainers automatically cleans up the _containers_, making it an efficient solution for realistic and effective integration testing.

Docker explained:
-----------------

Docker runs a database by encapsulating it within a container, creating a self-contained, isolated environment for the database to operate. Think of a container as a lightweight, standalone package that includes **everything** needed to run a software application, including the database and its dependencies.

Imagine you want to pack **everything** necessary to run a database instance or application into one folder, making it easily shareable. In this scenario, you’d need to encapsulate **all** components, creating a self-contained package. This will include:

1.  **Operating System (you can’t run applications without OS)**
2.  The application itself, like the Postgres database application
3.  Libraries
4.  Configurations
5.  Any other dependencies

Essentially, it’s like creating a compact environment that ensures deployment by including all the necessary building blocks. To streamline this process, the concept of “**containerization**” was introduced. Docker is the leading software in this domain. It uses images, which are pre-configured templates, to define the contents and settings of these containers. Using the `docker build` command, Docker constructs an image with all components required for your application. To help docker understand what components are needed for the application, developers define docker files.

When a user initiates a container running a database, Docker orchestrates the process by leveraging the host machine’s(your PC, server, pipeline, etc.) resources. The containerized database runs independently of the host system, isolated from other processes. Docker manages resource allocation, networking, and storage for the container, ensuring it operates consistently across different environments.

Docker technology utilizes a client-server architecture, where the Docker client communicates with the Docker daemon running on the host machine. The Docker daemon takes care of creating, starting, stopping, and deleting containers, all based on the specifications outlined in the Docker images.

In simpler terms, Docker makes running a database efficient and portable. It packages the database and its dependencies, ensuring it runs consistently, regardless of the underlying infrastructure, making it an easy solution for deploying and managing databases.

Integration test with TestContainers:
-------------------------------------

To leverage the power of test containers let's define the endpoint and then create a test case against it. To create an API for testing we’ll use DotNets Minimal APIs.

```
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.DataAccess;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(
    options => options.UseNpgsql(builder.Configuration.GetValue<string>("dbConnectionString"))
);
var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapGet("Users/{name}",
    async (string name, [FromServices] AppDbContext dbContext) =>
    {
        if (string.IsNullOrEmpty(name))
        {
            return null;
        }
        var user = await dbContext.Users.FirstOrDefaultAsync(x =>
            x.Name.Equals("GOR", StringComparison.InvariantCultureIgnoreCase));
        return Results.Ok(user);
    });
app.MapGet("Users",
    async ([FromServices] AppDbContext dbContext) =>
    {
        var user = await dbContext.Users.ToListAsync();
        
        return Results.Ok(user);
    });
app.Run();
await using var db = app.Services.GetRequiredService<AppDbContext>();
await db.Database.MigrateAsync();
public partial class Program
{
}
```

We simply define a GET endpoint inside our startup project - `GET /users/{name}` which gets a DBContext from DI as an argument. Then it creates a query to get the user by name. We also have defined partial class Program which is for integration tests. XUnit (the most famous testing framework for dotnet) requires the starting point to determine from where to build the web API to run tests. Starting from the new API version dotnet allows you to define the Program without the Program class and Main method, the compiler will do it for you. So it's a small trick to be able to access to Program class.

Then let's set up a project for running tests for the API. We will need some setup classes to spin up the environment and configure it. Let's start with the ApiHost class:

`ApiHost.cs`

```
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
namespace WebAppTests.Setup;
public class ApiHost : WebApplicationFactory<Program>
{
    private readonly string _dbConnectionString;
    public ApiHost(string dbConnectionString)
    {
        _dbConnectionString = dbConnectionString;
    }
    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, conf) =>
        {
            conf.AddInMemoryCollection(new Dictionary<string, string>
            {
                ["dbConnectionString"] = _dbConnectionString
            }!);
        });
        
        return base.CreateHost(builder);
    }
}
```

This class implements dotnet’s `WebApplicationFactory`class, which is created for spinning up WebApps for testing. By handling all necessary configurations it keeps abstraction so you can override them. Here we override the `CreateHost` method and define the connection string in the configurations named `dbConnectionString`.

Then let's define a class for spinning up the whole environment (both DB and API).

`AppFixture.cs`

```
using DotNet.Testcontainers;
using Testcontainers.PostgreSql;
using Xunit;
namespace WebAppTests.Setup;
public class AppFixture : IAsyncLifetime
{
    private PostgreSqlContainer _postgresContainer;
    private ApiHost _apiHost;
    public async Task InitializeAsync()
    {
        _postgresContainer = new PostgreSqlBuilder()
            .WithDatabase("WebAppDatabase")
            .Build();
        await _postgresContainer.StartAsync().ConfigureAwait(false);
        
        _apiHost = new ApiHost(_postgresContainer.GetConnectionString());
    }
    public IServiceProvider GetApiServiceProvider() => _apiHost.Services;
    
    public HttpClient CreateApiClient()
    {
        return _apiHost.CreateClient();
    }
    public async Task DisposeAsync()
    {
        await _postgresContainer.DisposeAsync();
        await _apiHost.DisposeAsync();
    }
}
```

In the `AppFixture` class we initialize `PostgresContainer` with custom configurations, in our case, we provide a database name — `WebAppDatabase`, then after running it, we provide the connection string to the `ApiHost` and initialize it also. If we decide to also use Redis in our app we simply will need to create a test container for it in `AppFixture` class, as it is part of our environment.

Finally, let's define a few more helping classes:

`BaseTests.cs`

```
†¥†using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.DataAccess;
using Xunit;
namespace WebAppTests.Setup;
public abstract class BaseTests : IAsyncLifetime
{
    protected readonly IServiceScope _scope;
    protected readonly AppFixture _appFixture;
    protected readonly AppDbContext _dbContext;
    protected BaseTests(AppFixture appFixture)
    {
        _appFixture = appFixture;
        _scope = appFixture.GetApiServiceProvider().CreateScope();
        _dbContext = Resolve<AppDbContext>();
    }
    
    protected T Resolve<T>() where T : notnull
    {
        return _scope.ServiceProvider.GetRequiredService<T>();
    }
    protected HttpClient CreateClient()
    {
        return _appFixture.CreateApiClient();
    }
    
    public async Task InitializeAsync()
    {
        var context = Resolve<AppDbContext>();
        await context.Database.MigrateAsync();
    }
    public Task DisposeAsync()
    {
        _scope.Dispose();
        
        return Task.CompletedTask;
    }
}
```

### Tests setup with XUnit:

Now that the entire environment is set up, we’re ready to dive into writing test cases. For this purpose, we’ll utilize the XUnit library. Below are examples of how the test cases might be structured:

`UserNameTests.cs`

```
namespace WebAppTests;
public class UserNameTests : BaseTests
{
    public UserNameTests(AppFixture fixture) : base(fixture)
    { }
    
    [Theory]
    [InlineData("Gor")]
    public async Task Can_Get_User_By_Name(string name)
    {
        var context = Resolve<AppDbContext>();
        await context.Users.AddAsync(new User { Name = "Gor" });
        await context.SaveChangesAsync();
        
        var response = await CreateClient().GetAsync($"Users/{name}");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.NotEmpty(json);
        
        var user = JsonConvert.DeserializeObject<User>(json);
        Assert.NotNull(user);
    }
    
    [Theory]
    [InlineData("GOR")]
    public async Task Can_Get_User_By_Name_Key_Insensitive(string name)
    {
        var context = Resolve<AppDbContext>();
        await context.Users.AddAsync(new User { Name = "Gor" });
        await context.SaveChangesAsync();
        
        var response = await CreateClient().GetAsync($"Users/{name}");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.NotEmpty(json);
        
        var user = JsonConvert.DeserializeObject<User>(json);
        Assert.NotNull(user);
    }
}
```

And one more: `UserTests.cs`

```
namespace WebAppTests;
public class UserTests : BaseTests
{
    public UserTests(AppFixture fixture) : base(fixture)
    { }
    
    [Fact]
    public async Task Can_Get_User_By_Name()
    {
        var context = Resolve<AppDbContext>();
        await context.Users.AddAsync(new User { Name = "Gor" });
        await context.SaveChangesAsync();
        
        var response = await CreateClient().GetAsync($"Users");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.NotEmpty(json);
        
        var user = JsonConvert.DeserializeObject<User[]>(json);
        Assert.NotNull(user);
        Assert.Single(user);
    }
}
```

As you have noticed all our test classes derive from `BaseTests` class which derived from `IAsyncLifetime` interface. The XUnit library executed test cases on its own grouping method, here is how it looks like in a diagram.

### XUnit test execution hierarchy

As you may have observed, all our test classes inherit from the `BaseTests` class, which itself implements the `IAsyncLifetime` interface. The XUnit library autonomously orchestrates the execution of test cases based on its grouping method. Below is the hierarchical structure of test grouping:

{{< img-caption src="xunit-execution-hierarchy.webp" caption="XUnit test execution hierarchy." >}}

1.  **Assembly / Project:** The highest level of grouping in XUnit is the assembly, which represents the entire test project. All test collections, classes, and methods within the same assembly are considered part of the same testing context.
2.  **Collection:** XUnit introduces the concept of Collections, which served as customized groupings of tests. These collections are logical containers for organizing tests based on specific criteria or functional requirements. By grouping tests within collections, developers can efficiently _manage setup and teardown_ operations while maintaining test isolation.
3.  **Test class:** In the absence of a specified collection, each test class is inherently considered a distinct collection. XUnit executes the `IAsyncLifetime` interface's `ExecuteAsync` method for each collection (in our case test class)
4.  **Test method:** Test methods in XUnit are categorized into two main types: `Fact` and `Theory`, distinguished by their respective attributes. `Fact` methods are conventional unit tests, while `Theory` methods support parameterized testing, allowing for the provision of multiple inputs and expected outcomes.
5.  **Test case:** Within `Theory` methods, `InlineData` attributes can be employed to define sets of input data, and XUnit executes the test method for each specified data set.

In our scenario, XUnit initializes the database separately for each test class (`UserTests` and `UserNameTests`), adhering to the test class isolation principle. However, the utilization of the Collections feature offers a strategic approach to grouping test classes together, thereby optimizing resource utilization and initialization processes by ensuring database setup occurs only once within the designated collection.

### Tests Collection:

Let’s establish a `UsersTestCollection` to organize our test classes:

```
using Xunit;
namespace WebAppTests.Setup;
[CollectionDefinition(nameof(UsersTestCollection))]
public class UsersTestCollection : ICollectionFixture<AppFixture>
{
}
```

In this setup, we utilize the `[CollectionDefinition]` attribute to designate `UsersTestCollection` as a collection recognized by XUnit. Additionally, our class inherits from `ICollectionFixture`, enabling XUnit to instantiate one `AppFixture` class for each member of `UsersTestCollection`. This ensures that each test class within the collection operates within its dedicated testing context.

Then we just apply it to our test classes:

```
[Collection(nameof(UsersTestCollection))]
public class UserTests : BaseTests
{ ... } 
[Collection(nameof(UsersTestCollection))]
public class UserNameTests : BaseTests
{ ... }
```

For our example, the hierarchical structure will look like this:

{{< img-caption src="tests-collection-hierarchy.webp" caption="Example hierarchy after applying an XUnit test collection." >}}

CI implementation
-----------------

Now that we have a functional version that runs locally, let’s extend our solution to support execution in pipelines. While we’ll focus on Azure Pipelines for our example, we’ll introduce an additional abstraction layer to ensure our solution remains adaptable and independent of any specific pipeline service, enabling it to be executed across various environments. This abstraction layer allows us to encapsulate pipeline-specific configurations and commands, ensuring flexibility and portability in our testing strategy.

Once again, Docker serves as our abstraction layer, using the benefits of containerization to minimize dependencies on specific runtime environments. Note that most of the pipeline services come with Docker installed on their agents.

### Running docker-in-docker

To achieve this, let’s craft a _Docker Compose_ configuration to run our tests. By encapsulating our testing environment within a Docker container, we ensure consistency and portability across different CI/CD platforms. This approach allows us to orchestrate our testing workflow regardless of the underlying infrastructure.

> Docker Compose is a tool for defining and running multi-container Docker applications. It uses YAML files to configure the services, networks, and volumes needed for your application, allowing you to manage complex application environments with ease.

`docker-compose/docker-compose.tests.yml`

```
version: '3.7'
services:
  tests:
    container_name: webapp.tests
    network_mode: "host"
    build:
      context: .
      dockerfile: ./tests.Dockerfile
      target: build
    command:
      - /bin/sh
      - -c
      - |
        dotnet test Running-docker-in-docker.sln && \
        echo "Done!"
    environment:
      - TESTCONTAINERS_HOST_OVERRIDE=localhost
    volumes:
      - ../.:/src
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/lib/docker:/var/lib/docker
```

`docker-compose/tests.Dockerfile`

```
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# "install" the dotnet 7 runtime
COPY --from=mcr.microsoft.com/dotnet/sdk:7.0 /usr/share/dotnet/shared /usr/share/dotnet/shared
WORKDIR /src
```

This Docker Compose file defines a service named `tests` for running tests within a Docker container. Here’s what each section does:

1.  **Container Configuration:** The `container_name` property sets the name of the container that will be created for this service to `webapp.tests`
2.  **Network** **Configuration:**`network_mode` is configured to `host`, allowing the container to utilize the host network settings directly. It means that the container will share the same network configuration as the host machine. Instead of having its own isolated network stack, the container will use the network interfaces, IP addresses, ports, and other network settings directly from the host. This is useful for scenarios where the container needs to interact with services running on the host or requires access to network resources that are not accessible from within a container’s isolated network environment.
3.  **Image Building:** The `build` section specifies how the Docker image for the service should be built:
    - `context` sets the build context to the current directory.
    - `dockerfile` specifies the path to the Dockerfile used for building the image.
4.  **Test Execution:** The `command` section specifies the command to be executed when the container starts. It uses a shell command (`/bin/sh -c`) to run tests using the .NET CLI (`dotnet test`) for the provided solution file (`Running-docker-in-docker.sln`). And after the tests are executed, it prints done.
5.  Environment Variables: The `environment` section sets environment variables for the container. It overrides the default hostname used by Testcontainers with `localhost` using the `TESTCONTAINERS_HOST_OVERRIDE` variable. Otherwise, the host will be `host.docker.internal` and outside services will not be accessible.
6.  **Volume Mounting:** The `volumes` section in a Docker Compose file allows you to specify directories or files on the host machine that should be mounted into the container. When you mount a volume, it creates a shared filesystem between the host and the container, allowing data to be shared and persisted across container restarts.
    In the context of our Docker Compose file, the `volumes` section mounts volumes from specific paths on the host machine into the container.

*   `../.:/src`: This mounts the parent directory on the host machine into the `/src` directory within the container. This allows the container to access and work with the files and directories from the host machine and is used for providing source code or other project files to the container.
*   `/var/run/docker.sock:/var/run/docker.sock`: This mounts the Docker socket file from the host machine into the container. _The Docker socket file (_`_docker.sock_`_) is used by Docker to communicate with the Docker daemon._ Mounting this socket into the container allows the container to interact with the Docker daemon on the host, enabling functionalities like building Docker images or managing containers from within the container itself (also called docker-in-docker)
*   `/var/lib/docker:/var/lib/docker`: This mounts the Docker data directory from the host machine into the container. The Docker data directory (`/var/lib/docker`) contains Docker-related data such as images, containers, volumes, and networks. Mounting this directory into the container allows the container to access Docker-related data and functionalities, such as inspecting Docker resources or accessing Docker volumes.

Below is the Azure Pipeline YAML configuration file for executing the Docker Compose file:

```
trigger:
  - main
pool:
  vmImage: 'ubuntu-latest'
steps:
  - checkout: self
    displayName: "Git Checkout"
    persistCredentials: true
  - task: DockerCompose@0
    displayName: 'Run tests'
    inputs:
      containerregistrytype: 'Container Registry'
      dockerComposeFile: 'docker-compose/docker-compose.tests.yml'
      action: 'Run a Docker Compose command'
      dockerComposeCommand: 'run tests'
```

Conclusion:
-----------

In conclusion, this article has provided a guide to leveraging Docker and Docker Compose for testing .NET applications using Testcontainers and integrating them easily into Azure Pipelines. By using the containerization principles, we can achieve consistent and reliable testing environments, independent of the underlying infrastructure. Through the detailed walkthrough of setting up Docker-in-Docker environments, managing dependencies, and orchestrating test execution, readers have gained valuable insights into optimizing their testing workflows.

Furthermore, the abstraction layers introduced ensure portability and flexibility, enabling testing across various CI/CD platforms. As software development continues to evolve, embracing container-based testing methodologies proves essential for maintaining the agility and reliability required in modern software delivery pipelines.

Github:
-------

[The whole project can be found on GitHub.](https://github.com/gor8808/Dotnet-running-docker-in-docker)

