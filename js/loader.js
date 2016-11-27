requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js"
    }
});

requirejs(["jquery.min"]);
requirejs(["bootstrap/bootstrap.min"]);
requirejs(["activity/activity"]);
