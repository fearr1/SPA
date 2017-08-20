$(() => {
    const host = "https://baas.kinvey.com";
    const app_key = "kid_SJcZp-vdW";
    const app_secret = "54793dba1b124c90853f6707e9a2e9b9";

    let sections = $("section");

    $("#commentForm").on("submit", function (e) {
        e.preventDefault();

        let desc = $("#commentForm").find("textarea").val();

        addComent(desc);
    });

    //EDIT POST
    let editPostForm = $("#editPostForm");
    editPostForm.on("submit", function (e) {
        e.preventDefault();
        let linkUrl = editPostForm.find("input[name='url']").val();
        let linkTitle = editPostForm.find("input[name='title']").val();
        let linkThumbnail = editPostForm.find("input[name='image']").val();
        let comment = editPostForm.find("textarea[name='description']").val();
        let id = $("#post_id").data("id");


        if (linkUrl.length < 5) {
            showError("Link must be more than 4 characters");
            return;
        }
        if (!linkUrl.match(/^(http)/)) {
            showError("Link url should start with http");
            return;
        }
        if (linkTitle.length < 1) {
            showError("Title must not be empty");
            return;
        }

        editPostAction(id, linkUrl, linkTitle, linkThumbnail, comment);
    });

    //ON LOGOUT
    $("#profile").find("a").on("click", function () {
        logout();
    });

    //ON LOAD (Processing)
    $(document).bind("ajaxStart", function () {
        $("#loadingBox").show();
    }).bind("ajaxStop", function () {
        $("#loadingBox").hide();
    });

    //HIDE ERROR
    $("#errorBox").on('click', function () {
        $(this).hide();
    });

    //SHOW CATALOG LINK
    $("#linkCatalog").on("click", function () {
        sections.hide();
        $("#viewCatalog").show();
        getPosts();
    });

    //ON SUBMIT LINK
    $("#linkSubmitLink").on("click", function () {
        sections.hide();
        $("#viewSubmit").show();
    });

    //ON SUBMIT LINK FORM
    let submitForm = $("#submitForm");
    submitForm.on("submit", function (e) {
        e.preventDefault();
        let linkUrl = submitForm.find("input[name='url']").val();
        let linkTitle = submitForm.find("input[name='title']").val();
        let linkThumbnail = submitForm.find("input[name='image']").val();
        let comment = submitForm.find("textarea[name='comment']").val();

        if (linkUrl.length < 5) {
            showError("Link must be more than 4 characters");
            return;
        }
        if (!linkUrl.match(/^(http)/)) {
            showError("Link url should start with http");
            return;
        }
        if (linkTitle.length < 1) {
            showError("Title must not be empty");
            return;
        }

        submitLink(linkUrl, linkTitle, linkThumbnail, comment);
    });

    //ON VIEW MY POSTS
    $("#linkMyPosts").on("click", function () {
        sections.hide();
        getMyPosts();
        $("#viewMyPosts").show();
    });

    //ON LOGIN
    let loginForm = $("#loginForm");
    loginForm.on("submit", function (e) {
        e.preventDefault();
        let username = loginForm.find('input[name="username"]').val();
        let password = loginForm.find('input[name="password"]').val();

        login(username, password);
    });

    //ON REGISTER
    let registerForm = $("#registerForm");
    registerForm.on("submit", function (e) {
        e.preventDefault();
        let username = registerForm.find("input[name='username']").val();
        let password = registerForm.find("input[name='password']").val();
        let repeatPass = registerForm.find("input[name='repeatPass']").val();

        //VALIDATION REGISTER
        if (username.length < 3) {
            showError("Username must be at least 3 chars");
            return;
        }
        if (password.length < 6) {
            showError("Password must be at least 6 chars");
            return;
        }
        if (!username.match(/^[a-zA-Z]+$/)) {
            showError("Username must contain only english alphabet letters");
            return;
        }
        if (!password.match(/^[a-zA-Z0-9]+$/)) {
            showError("Password should contain only alphabetical and numeric chars");
            return;
        }
        if (password !== repeatPass) {
            showError("Password missmatch");
            return;
        }

        register(username, password);
    });

    //SHOW VIEW FOR GUEST/USER
    if (sessionStorage.getItem("authtoken")) {
        showUserHome(sessionStorage.getItem("username"));
    } else {
        showHomeGuest();
    }

    function login(username, password) {
        let req = {
            url: host + "/user/" + app_key + "/login",
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: "Basic " + btoa(app_key + ":" + app_secret)
            },
            data: JSON.stringify({
                username,
                password
            }),
            success: function (data) {
                showSuccess("You have successfully logged in");
                loginForm.find("input").val("");
                setStorage(data.username, data._kmd.authtoken);
                showUserHome(data.username);
            },
            error: function (data) {
                showError(data.responseJSON.description);
            }
        };

        $.ajax(req);
    }

    function register(username, password) {
        let req = {
            url: host + "/user/" + app_key,
            contentType: "application/json",
            method: "POST",
            headers: {
                Authorization: "Basic " + btoa(app_key + ":" + app_secret)
            },
            data: JSON.stringify({
                username,
                password
            }),
            success: function (data) {
                showSuccess("You have successfully registered!");
                setStorage(data.username, data._kmd.authtoken);
                registerForm.find("input").val("");
            },
            error: function (data) {
                showError(data.responseJSON.description);
            }
        };

        $.ajax(req);
    }

    function showHomeGuest() {
        $("#menu").hide();
        $("#profile").hide();
        sections.hide();
        $("#viewWelcome").show();
    }

    function showError(message) {
        let errorBox = $("#errorBox");
        errorBox.find("span").text(message);
        errorBox.show();
    }

    function showSuccess(message) {
        let successBox = $("#infoBox");
        successBox.find("span").text(message);
        successBox.show();
        setTimeout(() => successBox.hide(), 2000);
    }

    function setStorage(username, authtoken) {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("authtoken", authtoken);
    }

    function showUserHome(username) {
        let greeting = $("#profile");
        sections.hide();
        greeting.find("span").text(username);
        greeting.show();
        getPosts();
        $("#menu").show();
        $("#viewCatalog").show();
    }

    function logout() {
        let req = {
            url: host + "/user/" + app_key + "/_logout",
            method: "POST",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: function () {
                sessionStorage.clear();
                showHomeGuest();
                showSuccess("You have successfully logged out");
            },
            error: function (data) {
                showError(data.responseJSON.description);
            }
        };

        $.ajax(req);
    }

    function getPosts() {
        let req = {
            url: host + "/appdata/" + app_key + "/posts" + `?query={}&sort={"_kmd.ect": -1}`,
            method: "GET",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: (data) => {
                renderPosts(data);
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };

        $.ajax(req);
    }

    function renderPosts(posts) {
        let viewCatalog = $("#viewCatalog");
        let postsView = viewCatalog.find(".posts");
        postsView.html("");
        if (posts.length > 0) {
            posts.forEach(function (post, index) {

                let imageSrc = post.imageUrl;
                let url = post.url;
                let title = post.title;
                let author = post.author;
                let id = post._id;
                let date = calcTime(post._kmd.ect);

                let postHtml = `<article class="post">
                    <div class="col rank">
                        <span>${index + 1}</span>
                    </div>
                    <div class="col thumbnail">
                        <a href="${url}">
                            <img src="${imageSrc}">
                        </a>
                    </div>
                    <div class="post-content">
                        <div class="title">
                            <a href="${url}">
                                ${title}
                            </a>
                        </div>
                        <div class="details">
                            <div class="info">
                                submitted ${date} day ago by ${author}
                            </div>
                            <div class="controls" data-id="${id}">
                                <ul>
                                    <li class="action"><a class="commentsLink" href="#">comments</a></li>
                                    <li class="action"><a class="editLink" href="#">edit</a></li>
                                    <li class="action"><a class="deleteLink" href="#">delete</a></li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </article>
`;
                postsView.append(postHtml);
            });
        } else {
            postsView.append("<h3>No posts in database</h3>");
        }

        postsView.find(".commentsLink").on("click", function () {
            getDetails($(this).closest(".controls").data("id"));
        });
        postsView.find(".editLink").on("click", function () {
            getPost($(this).closest(".controls").data("id"));
        });
        postsView.find(".deleteLink").on("click", function () {
            deletePost($(this).closest(".controls").data("id"));
        });

    }

    function renderMyPosts(posts) {
        let viewMyPosts = $("#viewMyPosts");
        let postsView = viewMyPosts.find(".posts");
        postsView.html("");
        if (posts.length > 0) {
            posts.forEach(function (post, index) {

                let imageSrc = post.imageUrl;
                let url = post.url;
                let title = post.title;
                let author = post.author;
                let id = post._id;
                let date = calcTime(post._kmd.ect);

                let postHtml = `<article class="post">
                    <div class="col rank">
                        <span>${index + 1}</span>
                    </div>
                    <div class="col thumbnail">
                        <a href="${url}">
                            <img src="${imageSrc}">
                        </a>
                    </div>
                    <div class="post-content">
                        <div class="title">
                            <a href="${url}">
                                ${title}
                            </a>
                        </div>
                        <div class="details">
                            <div class="info">
                                submitted ${date} day ago by ${author}
                            </div>
                            <div class="controls" data-id="${id}">
                                <ul>
                                    <li class="action"><a class="commentsLink" href="#">comments</a></li>
                                    <li class="action"><a class="editLink" href="#">edit</a></li>
                                    <li class="action"><a class="deleteLink" href="#">delete</a></li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </article>
`;
                postsView.append(postHtml);
            });
        } else {
            postsView.append("<h3>No posts in database</h3>");
        }

        postsView.find(".commentsLink").on("click", function () {
            getDetails($(this).closest(".controls").data("id"));
        });
        postsView.find(".editLink").on("click", function () {
            getPost($(this).closest(".controls").data("id"));
        });
        postsView.find(".deleteLink").on("click", function () {
            deletePost($(this).closest(".controls").data("id"));
        });
    }

    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }

    function submitLink(linkUrl, linkTitle, linkThumb, comment) {
        let req = {
            url: host + "/appdata/" + app_key + "/posts",
            method: "POST",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            contentType: "application/json",
            data: JSON.stringify({
                author: sessionStorage.getItem("username"),
                title: linkTitle,
                url: linkUrl,
                imageUrl: linkThumb,
                description: comment
            }),
            success: () => {
                showSuccess("Post created successfully");
                showUserHome(sessionStorage.getItem("username"));
                let inputs = submitForm.find("input");
                let textarea = submitForm.find("textarea");
                inputs[0].value = "";
                inputs[1].value = "";
                inputs[2].value = "";
                textarea.val();

            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };

        $.ajax(req);
    }

    function getMyPosts() {
        let username = sessionStorage.getItem("username");
        let req = {
            url: host + "/appdata/" + app_key + "/posts" + `?query={"author":"${username}"}&sort={"_kmd.ect": -1}`,
            method: "GET",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: (data) => {
                renderMyPosts(data);
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };

        $.ajax(req);
    }

    function getDetails(id) {
        let req = {
            url: host + "/appdata/" + app_key + "/posts/" + id,
            method: "GET",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: (data) => {
                getComments(data);
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };
        $.ajax(req);
    }

    function getComments(post) {
        let req = {
            url: host + "/appdata/" + app_key + "/comments" + `?query={"postId":"${post._id}"}&sort={"_kmd.ect": -1}`,
            method: "GET",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: (data) => {
                showDetails(post, data);
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };
        $.ajax(req);
    }

    function showDetails(post, comments) {
        sections.hide();
        let viewComments = $("#viewComments");
        let postDetails = viewComments.find(".post").first();

        let postHtml = `
            <div class="post">
                <div class="col thumbnail">
                    <a href="${post.url}">
                        <img src="${post.imageUrl}">
                    </a>
                </div>
                <div class="post-content">
                    <div class="title">
                        <a href="${post.url}">
                            ${post.title}
                        </a>
                    </div>
                    <div class="details">
                        <p>${post.description}</p>
                        <div class="info">
                            submitted ${calcTime(post._kmd.ect)} days ago by ${post.author}
                        </div>
                        <div class="controls" data-id="${post._id}">
                            <ul>
                                <li class="action"><a class="editLink" href="#">edit</a></li>
                                <li class="action"><a class="deleteLink" href="#">delete</a></li>
                            </ul>
                        </div>

                    </div>
                </div>
                <div class="clear"></div>
            </div>
        `;

        viewComments.find("article").remove();

        comments.forEach(function (comment) {

            let commentHtml = `
            <article class="post post-content">
                <p>${comment.content}</p>
                <div class="info">
                    submitted ${calcTime(comment._kmd.ect)} days ago by ${comment.author} | <a href="#" class="deleteLink" data-id="${comment._id}">delete</a>
                </div>
            </article>
            `;

            viewComments.append(commentHtml);

        });

        viewComments.find(".post-content").find(".deleteLink").on("click", function () {
            let id = $(this).data("id");
            deleteComment(id);
        });

        postDetails.html(postHtml);
        viewComments.find(".post").find(".controls").find(".deleteLink").on("click", function () {
            let id = $(this).closest(".controls").data("id");
            deletePost(id);
        });
        viewComments.show();
        let commentsSection = $("#viewComments");
    }

    function deletePost(id) {
        let req = {
            url: host + "/appdata/" + app_key + "/posts/" + id,
            method: "DELETE",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: () => {
                showSuccess("You have successfully deleted post");
                showUserHome(sessionStorage.getItem("username"));
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };
        $.ajax(req);
    }

    function deleteComment(id) {
        let req = {
            url: host + "/appdata/" + app_key + "/comments/" + id,
            method: "DELETE",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: () => {
                showSuccess("You have successfully deleted comment");
                showUserHome(sessionStorage.getItem("username"));
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };
        $.ajax(req);
    }

    function editPost(post) {
        sections.hide();
        let editView = $("#viewEdit");

        editView.find("input[name='url']").val(post.url);
        editView.find("input[name='title']").val(post.title);
        editView.find("input[name='image']").val(post.imageUrl);
        editView.find("textarea[name='comment']").val(post.description);
        let id = `<p id="post_id" data-id="${post._id}" hidden></p>`;
        editView.append(id);

        editView.show();
    }

    function getPost(id) {
        let req = {
            url: host + "/appdata/" + app_key + "/posts/" + id,
            method: "GET",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            success: (data) => {
                editPost(data);
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };
        $.ajax(req);
    }

    function editPostAction(id, url, title, imageUrl, description) {
        let req = {
            url: host + "/appdata/" + app_key + "/posts/" + id,
            method: "PUT",
            headers: {
                Authorization: "Kinvey " + sessionStorage.getItem("authtoken")
            },
            contentType: "application/json",
            data: JSON.stringify({
                author: sessionStorage.getItem("username"),
                title,
                url,
                imageUrl,
                description
            }),
            success: () => {
                showSuccess("You have successfully edited a post");
                showUserHome(sessionStorage.getItem("username"));
            },
            error: (data) => {
                showError(data.responseJSON.description);
            }
        };

        $.ajax(req);
    }

    function addComent(text){
        let req = {
            url: host + "/appdata/" + app_key,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                author: sessionStorage.getItem("username"),
                content: text
            }),
            success: () => {
                showSuccess("Comment added");
            },
            error: () => {
                showError("somethign went wrong");
            }
        }
    }

});