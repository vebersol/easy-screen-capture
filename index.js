var puppeteer = require('puppeteer');
var fs = require('file-system');

var dirname = "";
var timeout = 30000;
var total = 0;

function validateUrl(url) {
    var test = true;
    //url validation
    if (!url || url === "") {
        console.error("URL must present", url);
        return false;
    }

    if (typeof (url) !== "string") {
        console.error("URL is incorrect", url);
        return false;
    }

    if (url.indexOf(".") === -1) {
        console.error("URL is incorrect", url);
        return false;
    }

    var test = url.split(":");

    if (test[0] !== "http" && test[0] !== "https" && test[0] !== "ftp") {
        console.error("URL must contain host name", url);
        return false;
    }

    if (test[1].slice(0, 2) !== "//") {
        test = false;
        console.error("URL is incorrect", url);
    }
    return test;
}

function validate(viewports, urls) {
    var test = true;
    for (var i = 0; i < viewports.length; i++) {
        var width = viewports[i].width;
        var height = viewports[i].height;

        if (isNaN(width) || width === "") {
            test = false;
            console.error("invalid width");
        }
        if (isNaN(height) || height === "") {
            test = false;
            console.error("invalid height");
        }
    }

    for (var i = 0; i < urls.length; i++) {
        if (!validateUrl(urls[i].url)) {
            test = false;
        }
    }
    return test;
}

async function getScreenshots(page, directory, height, width, name) {
    var screenshotPath;
    if (!name) {
        var filename = new Date().getTime().toString() + Math.floor((Math.random() * 100000) + 1) + "(" + height + "x" + width + ").png";
    } else {
        var filename = name + "(" + height + "x" + width + ").png";
    }

    screenshotPath = directory + "/" + filename;
    if (directory === "") {
        screenshotPath = "assets-easy-screen-capture/" + filename;
    }
    try {
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

    } catch (err) {
        console.log(err);
    }

    console.info("successfully captured");
    return total++;
}

async function getUrlAndResolutions(viewports, urls) {
    if (dirname === "") {
        fs.mkdir("assets-easy-screen-capture", function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    try {
        let test = await setViewports(viewports, urls, dirname);
        if (test === false)
            return;
        else
            return test;
    } catch (err) {
        console.error(err);
    }
}

async function setViewports(viewports, urls, directory) {
    try {
        var browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            timeout: timeout,
        });

        var page = await browser.newPage();

        await page.waitFor(500);

        for (var i = 0; i < urls.length; i++) {
            await page.goto(urls[i].url);

            for (var j = 0; j < viewports.length; j++) {
                // Setting-up viewports
                await page.setViewport(viewports[j]);

                await getScreenshots(page, directory, viewports[j].height, viewports[j].width, urls[i].name);
            }
        }

        browser.close();

        return total;

    } catch (err) {
        console.error(err);
        return false;
    }
}

function sanitizeLocation(location) {
    return location.replace(/[|"<>:*?]/g, "");
}

module.exports.capture = function (viewports, urls, location, callback) {
    if (typeof (urls) === "string") {
        urls = [{
            url: urls
        }];
    }

    if (location) {
        this.setDir(location);
    }

    if (!validate(viewports, urls)) {
        return;
    }

    return getUrlAndResolutions(viewports, urls);
};

module.exports.setDir = function (location) {
    if (typeof (location) !== "string") {
        console.log("Location must be an string");
        return;
    }
    location = sanitizeLocation(location);
    console.log("After sanitization your path will be:", location);

    if (!fs.existsSync(location)) {
        fs.mkdir(location, function (err) {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

    dirname = location;
};

module.exports.setTimeOut = function (duration = 30000) {
    if (isNaN(duration)) {
        console.error("Inavalid Duration");
        return;
    }
    timeout = duration;
};