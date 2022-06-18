window.onload = function () {

    // Initializing url path
    var Path = window.location.pathname;

    // Paths with nav bar
    const pathWithNavBar = ["/edit_picture", "/edit_username", "/edit_bio", "/edit_email", "/edit_password"];
    const ePathWithNavBar = pathWithNavBar[Symbol.iterator]();
    
    // Check for right path
    if (Path == "/edit_bio" || Path == "/profile") {
        textWordCount();
    }
    else if (Path == "/edit_picture") {
        cropImage();
    }
    else if (Path == "/home") {
        profilePath();
    }
    else if (Path == "/post") {
        cropImage();
    }
    else if (Path == "/tips") {
        tips();
    }
    else if (Path == "/challenges") {
        challenges();
    }
    else if (Path == "/search") {
        searchRoute();
    }
    else if (Path == "/myprofile_lg" || Path == "/myprofile_sm") {
        post();
    }
    else if (Path == "/report_bug") {
        bug_report();
    }
    else if (Path == "/journeys") {
        journeys()
    }
    
    // Iterating to show nav bar
    for (let p of ePathWithNavBar) {
        if (p == Path) {
            navBar();
        }
    }

}

function textWordCount() {

    // For Profile
    var bioText = document.querySelector(".set-bio");
    var result = document.querySelector(".result");
    var warning = document.querySelector(".warning");
    var limit = 60;

    result.textContent = 0 + "/" + limit;

    // Display the character used by the user
    bioText.addEventListener("input", function () {
        var textLength = bioText.value.length;
        result.textContent = textLength + "/" + limit;

        // Ensure user doesn't submit bio more than 60 characters
        if (textLength >= limit) {
            // Initialize
            result.textContent = "60/60";
            result.style.color = "red";
            warning.textContent = "Bio must be less than 60 Characters."
            warning.style.color = "red";

            // User writes
            bioText.onkeypress = function () {
                if (this.value.length >= limit) return false;
            }

            // User pastes
            bioText.onpaste = function () {
                if (this.value.length >= limit) return false;
            }
        
        } else {
            result.style.color = "#212529"
        }
    });
}

function navBar() {

    // For edit page
    openNavBar = document.querySelector("#openbtn");
    closeNavBar = document.querySelector(".closebtn");

    /* Set the width of the side navigation to 250px */
    openNavBar.addEventListener("click", function () {
        document.getElementById("mySidenav").style.width = "250px";
    });

    /* Set the width of the side navigation to 0 */
    closeNavBar.addEventListener("click", function () {
        document.getElementById("mySidenav").style.width = "0";
    });
}

function cropImage() {

    // Initialize variables
    let result = document.querySelector(".result"),
    img_result = document.querySelector(".img-result"),
    options = document.querySelector(".options"),
    cropped = document.querySelector(".cropped"),
    upload = document.querySelector("#file-input"),
    imageXAxis = document.querySelector("#x-axis"),
    imageYAxis = document.querySelector("#y-axis"),
    imageWidth = document.querySelector("#width"),
    imageHeight = document.querySelector("#height"),
    imgSrc = "",
    cropX = "",
    cropY = "",
    cropWidth = "",
    cropHeight = "",
    cropper = "";

    // Saving image points
    function saveImageValue(x, y, width, height) {
        imageXAxis.value = x;
        imageYAxis.value = y;
        imageWidth.value = width;
        imageHeight.value = height;
    }
    
    // on change show image with crop options
    upload.addEventListener("change", (e) => {
    if (e.target.files.length) {
        // start file reader
        const reader = new FileReader();
        reader.onload = (e) => {
        if (e.target.result) {
            // create new image
            let img = document.createElement("img");
            img.id = "image";
            img.src = e.target.result;
            // clean result before
            result.innerHTML = "";
            // append new image
            result.appendChild(img);
            // show save btn and options
            options.classList.remove("hide");
            // init cropper
            cropper = new Cropper(img, {
            aspectRatio: 1/1,
            crop(event) {
                cropX = event.detail.x;
                cropY = event.detail.y;
                cropWidth = event.detail.width;
                cropHeight = event.detail.height;
                saveImageValue(cropX, cropY, cropWidth, cropHeight);
            }
            });
        }
        };
        reader.readAsDataURL(e.target.files[0]);
        // remove hide class of img
        cropped.classList.remove("hide");
        img_result.classList.remove("hide");
        cropped.src = imgSrc;
    }
    });
}

function profilePath() {

    // Directing to different routes depending on the width of the screen
    if (window.innerWidth > 480) {
        window.location.href = "/myprofile_lg";
    }
    else {
        window.location.href = "/myprofile_sm";
    }
}

function displayPosts() {

    // Initialize variables
    var post = document.querySelectorAll(".post-content"),
	body = document.querySelector("body");
	presentation = document.querySelector(".presentation"),
	presentationExtra = document.querySelector(".presentation-extra"),
	deleteBtn = document.querySelector(".delete-btn"),
	cancelBtn = document.querySelector(".cancel-btn"),
	deleteAlert = document.querySelector(".delete-alert"),
	confirmCancel = document.querySelector(".confirm-cancel"),
	column = document.querySelectorAll(".column"),
	homeBtn = document.querySelectorAll(".home-btn"),
	threeDots = document.querySelector(".bi-three-dots"),
	postEnl = document.querySelectorAll(".post-content-enl")
	heart = document.querySelector(".bi-heart"),
	postLikes = document.querySelector(".likes"),
	heartFill = document.querySelector(".bi-heart-fill"),
	btnClose = document.querySelector(".btn-close");

	post.forEach(item => {
		item.addEventListener("click", () => {
			presentation.style.display = "flex";
			btnClose.style.display = "inline";
			presentation.childNodes[1].src = item.src;
			body.style.overflow = "hidden";
		});
	});

	btnClose.addEventListener("click", () => {
		btnClose.style.display = "none";
		presentation.style.display = "none";
		body.style.overflow = "auto";
	})

	threeDots.addEventListener("click", () => {
		presentationExtra.style.display = "flex";
	});

	cancelBtn.addEventListener("click", () => {
		presentationExtra.style.display = "none";
	});

	deleteBtn.addEventListener("click", () => {
		deleteAlert.style.display = "flex";
		presentationExtra.style.display = "none";
	});

	confirmCancel.addEventListener("click", () => {
		deleteAlert.style.display = "none";
	});

	heart.addEventListener("click", () => {
		postLikes.innerText = Number(postLikes.innerText) + 1;
		heart.style.display = "none";
		heartFill.style.display = "inline";
	});

	heartFill.addEventListener("click", () => {
		postLikes.innerText = Number(postLikes.innerText) - 1;
		heart.style.display = "inline";
		heartFill.style.display = "none";
	});
}

function tips() {
    
    // Initialize variables
    let commentIcon = document.querySelectorAll(".comment-tips"),
    emptyHeart = document.querySelectorAll(".bi-heart"),
    fillHeart = document.querySelectorAll(".bi-heart-fill"),
    chat = document.querySelectorAll(".bi-chat-left"),
    deleteBtn = document.querySelector(".delete"),
    cancelBtn = document.querySelector(".cancel"),
    likesBtn = document.querySelector(".likes"),
    menu = document.querySelectorAll(".bi-three-dots-vertical"),
    action = document.querySelector(".action"),
    biX = document.querySelector(".bi-x"),
    likedBy = document.querySelector(".liked-by"),
    postComment = document.querySelectorAll(".post"),
    body = document.querySelector("body"),
    id;

    biX.addEventListener("click", () => {
        likedBy.style.display = "none";
    });
    
    postComment.forEach(item => {
        item.addEventListener("click", event => {
            commentContainer = event.path[2].childNodes[5];
            let _id = event.path[3].childNodes[1].childNodes[3].childNodes[3].childNodes[9].value;
            let comment = event.path[1].childNodes[1].value;
            addComment(_id, "tips", comment);
            setTimeout(displayComments(_id, "tips", commentContainer), 2000);
        });
    });

    menu.forEach(item => {
        item.addEventListener("click", event => {
            id = event.path[1].childNodes[9].value;
            action.style.display = "flex";
            body.style.overflow = "hidden";
        });
    });

    likesBtn.addEventListener("click", () => {
        displayLikes(id, "tips")
    });

    cancelBtn.addEventListener("click", () => {
        action.style.display = "none";
        body.style.overflow = "auto";
    });
    
    deleteBtn.addEventListener("click", () => {
        deleteContent(id, "tips");
    });
    
    chat.forEach(item => {
        item.addEventListener("click", event => {
    
            commentSection = event.path[4].childNodes[3];
            id = event.path[2].childNodes[3].childNodes[9].value;
            commentContainer = event.path[4].childNodes[3].childNodes[5];

            if (commentSection.style.display == "inline-block") {
                commentSection.style.display = "none";
            }
            else {
                commentSection.style.display = "inline-block";
                displayComments(id, "tips", commentContainer);
            }
        });
    });
    
    emptyHeart.forEach(item => {
        item.addEventListener("click", event => {
            
            increaseLikes(event.path[1].childNodes[9].value, "tips");
            
            event.target.style.display = "none";
            event.path[1].childNodes[3].style.display = "inline";
        });    
    });
    
   
    fillHeart.forEach(item => {
        item.addEventListener("click", event => {

            decreaseLikes(event.path[1].childNodes[9].value, "tips");
            
            event.target.style.display = "none";
            event.path[1].childNodes[1].style.display = "inline";
        });
    });
}

function challenges() {

    // Initialize variables
    let menu = document.querySelectorAll(".bi-three-dots-vertical"),
    action = document.querySelector(".action"),
    cancelBtn = document.querySelector(".cancel"),
    deleteBtn = document.querySelector(".delete"),
    body = document.querySelector("body"),
    partakersBtn = document.querySelector(".partakers"),
    likedBy = document.querySelector(".liked-by"),
    biX = document.querySelector(".bi-x"),
    id;
    
    menu.forEach(item => {
        item.addEventListener("click", event => {
           id = event.path[1].childNodes[3].value;
           action.style.display = "flex";
           body.style.overflow = "hidden";
        });
    });

    deleteBtn.addEventListener("click", () => {
        deleteContent(id, "challenges");
    });

    partakersBtn.addEventListener("click", () => {
        displayLikes(id, "challenges");
    });
    
    cancelBtn.addEventListener("click", () => {
        action.style.display = "none";
        body.style.overflow = "auto";
    });

    biX.addEventListener("click", () => {
        likedBy.style.display = "none";
    });
}

function searchRoute() {
    var searchIcon = document.querySelector(".bi-search"),
    searchInfo = document.querySelector(".search-info");

    searchIcon.addEventListener("click", () => {
        search(searchInfo.value);
    });
}

function search(search) {

    // Declare variables
    let aj = new XMLHttpRequest,
    display = document.querySelector(".display");
    
    while (display.children.length > 0) {
        display.removeChild(display.lastChild);
    }

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {

            // Make response iterable
            let accounts = JSON.parse(this.response)[Symbol.iterator]();

            for (account of accounts) {

                if (account["result"] == "empty") {
                    card = document.createElement("div");
                    card.classList = "card";
                    text = document.createTextNode("Not Found");
                    card.appendChild(text);
                    display.appendChild(card);
                    return;
                }
                
                card = document.createElement("div");
                card.classList = "card";
                card.setAttribute("onclick", "cardClicked(event)"); 
                content = document.createElement("div");
                content.classList = "content";
                img = document.createElement("img");
                img.src = "static/uploads/" + account["image"];
                span = document.createElement("span");
                username = document.createTextNode(account["username"]);
                span.appendChild(username);
                content.appendChild(img);
                content.appendChild(span);
                extraContent = document.createElement("div");
                extraContent.classList = "extra-content";
                date = document.createTextNode(calcDate(account["started_on"]) + "/" + calcChallenge(account["level"]));
                extraContent.appendChild(date);
                card.appendChild(content);
                card.appendChild(extraContent);
                display.appendChild(card);
            }
        }
    }

    data = JSON.stringify({
        "search": search
    });

    aj.open("POST", "/search", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function cardClicked(e) {

    let wrapper = document.querySelector(".search-wrapper"),
    main = document.querySelector(".search-main");

    const width = window.innerWidth;

    // Applying different behaviours depending on the screen size
    if (width >= 720) {
        main.style.display = "inline-block";
    }
    else {
        main.style.display = "inline-block";
        wrapper.style.display = "none";
        main.style.fontSize = "1em";
    }
    
    // Submitting username to search2 and  getPosts

    search2(e.path[0].childNodes[0].childNodes[1].innerText);

    getPosts(e.path[0].childNodes[0].childNodes[1].innerText);
}

function search2(search) {

    let aj = new XMLHttpRequest,
    display = document.querySelector(".display"),
    profileImg = document.querySelector(".profile-img"),
    username = document.querySelector(".username"),
    bio = document.querySelector(".bio"),
    challenge = document.querySelector(".challenge-text"),
    dayOn = document.querySelector(".day-on"),
    hoursCompleted = document.querySelector(".hours-completed");

    while (display.children.length > 0) {
        display.removeChild(display.lastChild);
    }

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {
            let response = JSON.parse(this.response);
            
            profileImg.src = "/static/uploads/" + response[0].image;
            username.innerHTML = response[0].username;
            bio.innerHTML = response[0].bio;
            challenge.innerHTML = "Challenge: " + calcChallenge(response[0].level) + "DaysOf" + response[0].name;
            dayOn.innerHTML = "Day: " + calcDate(response[0].started_on) + "/" + calcChallenge(response[0].level);
            hoursCompleted.innerHTML = calcHours(response[0].started_on, response[0].dedication) + " hours completed.";
            connections(search);     
        }
    }

    data = JSON.stringify({
        "search": search
    });

    aj.open("POST", "/search", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function connections(search) {

    let aj = new XMLHttpRequest,
    followers = document.querySelector(".followers"),
    follow = document.querySelector(".follow");

    aj.onreadystatechange = function() {

        if (aj.readyState == 4 && aj.status == 200) {

            response = JSON.parse(this.response);

            if (response[0].connection == "true") {
                followers.innerHTML = response[0].followers + " Followers";
                follow.innerHTML = "Following";
                follow.setAttribute("onclick", "unfollow(event)");
            }
            else {
                followers.innerHTML = response[0].followers + " Followers";
                follow.innerHTML = "Follow";
                follow.setAttribute("onclick", "follow(event)");
            }
            
        }
    }

    data = JSON.stringify({
        "search": search
    });

    aj.open("POST", "/connections", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function unfollow(event) {

    let aj = new XMLHttpRequest,
    followers = document.querySelector(".followers"),
    arr = followers.innerHTML.split(" ");

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {
            response = JSON.parse(this.response)

            if (response[0].results == "success") {
                event.target.innerHTML = "Follow";
                event.target.removeAttribute("onclick"),
                followers.innerHTML = (Number(arr[0]) - 1) + " Followers";
                event.target.setAttribute("onclick", "follow(event)");
            }

        }
    }

    data = JSON.stringify({
        "username": event.path[5].childNodes[3].childNodes[1].innerHTML
    });

    aj.open("POST", "/unfollow", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function follow(event) {

    aj = new XMLHttpRequest,
    followers = document.querySelector(".followers"),
    arr = followers.innerHTML.split(" ");

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {
            response = JSON.parse(this.response)

            if (response[0].results == "success") {
                event.target.innerHTML = "Following";
                followers.innerHTML = (Number(arr[0]) + 1) + " Followers";
            }

            else if (response[0].results == "exists") {
                alert("You are already following this account.")
            }

            else {
                alert("You can't follow yourself.");
            }
        }
    }

    data = JSON.stringify({
        "username": event.path[5].childNodes[3].childNodes[1].innerHTML
    });

    aj.open("POST", "/follow", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function getPosts(name) {

    let aj = new XMLHttpRequest,
    postsSection = document.querySelector(".posts-section");

    while (postsSection.children.length > 0) {
        postsSection.removeChild(postsSection.lastChild);
    }

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {

            var posts = JSON.parse(this.response),
            length = posts.length,
            newLength = length,
            posts = posts[Symbol.iterator]();

            for (image of posts) {

                // For the first post only
                if (length == newLength) {
                    postContainer = document.createElement("div");
                    postContainer.classList = "post-container";
                    innerContainer = document.createElement("div");
                    innerContainer.classList = "inner-container";
                    column = document.createElement("div");
                    column.classList = "column";
                    img = document.createElement("img");
                    img.classList = "post";
                    img.src = "static/uploads/" + image["post_address"];
                    column.appendChild(img);
                    input = document.createElement("input");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("value", image["id"]);
                    column.appendChild(input);
                    column.setAttribute("onclick", "imgViewer(event)")
                    innerContainer.appendChild(column);
                    postContainer.appendChild(innerContainer);
                    newLength--;
                }

                // Check if a row is full. If true then start a new row
                else if (postContainer.children.length == 3) {
                    postContainer = document.createElement("div");
                    postContainer.classList = "post-container";
                    innerContainer = document.createElement("div");
                    innerContainer.classList = "inner-container";
                    column = document.createElement("div");
                    column.classList = "column";
                    img = document.createElement("img");
                    img.classList = "post";
                    img.src = "static/uploads/" + image["post_address"];
                    column.appendChild(img);
                    input = document.createElement("input");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("value", image["id"]);
                    column.appendChild(input);
                    column.setAttribute("onclick", "imgViewer(event)")
                    innerContainer.appendChild(column);
                    postContainer.appendChild(innerContainer);
                }

                // Fill up a row
                else {
                    innerContainer = document.createElement("div");
                    innerContainer.classList = "inner-container";
                    column = document.createElement("div");
                    column.classList = "column";
                    img = document.createElement("img");
                    img.classList = "post";
                    img.src = "static/uploads/" + image["post_address"];
                    column.appendChild(img);
                    input = document.createElement("input");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("value", image["id"]);
                    column.appendChild(input);
                    column.setAttribute("onclick", "imgViewer(event)")
                    innerContainer.appendChild(column);
                    postContainer.appendChild(innerContainer);
                    postsSection.appendChild(postContainer);
                }         
            } 

            // Calculate remaining unused space in a row
            var remainder = 3 * Math.ceil(length / 3) - length;
            
            // Fill up remaining space
            for (var i = 0; i < remainder; i++) {
                innerContainer = document.createElement("div");
                innerContainer.classList = "inner-container";
                column = document.createElement("div");
                column.classList = "column";
                innerContainer.appendChild(column);
                postContainer.appendChild(innerContainer);
                postsSection.appendChild(postContainer);
            }
        }
    }

    data = JSON.stringify({
        "name": name
    });

    aj.open("POST", "/get_posts", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function getPostsForLargeDevices(name) {

    let aj = new XMLHttpRequest,
    postsSection = document.querySelector(".posts-section-lg");

    // Delete old information
    while (postsSection.children.length > 0) {
        postsSection.removeChild(postsSection.lastChild);
    }

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {

            var posts = JSON.parse(this.response);

            if (posts.length > 0) {

                length = posts.length,
                newLength = length,
                posts = posts[Symbol.iterator]();

                for (image of posts) {

                    if (length == newLength) {
                        postContainer = document.createElement("div");
                        postContainer.classList = "post-container";
                        innerContainer = document.createElement("div");
                        innerContainer.classList = "inner-container";
                        column = document.createElement("div");
                        column.classList = "column";
                        img = document.createElement("img");
                        img.classList = "post";
                        img.src = "static/uploads/" + image["post_address"];
                        column.appendChild(img);
                        input = document.createElement("input");
                        input.setAttribute("type", "hidden");
                        input.setAttribute("value", image["id"]);
                        column.appendChild(input);
                        column.setAttribute("onclick", "imgViewer(event)")
                        innerContainer.appendChild(column);
                        postContainer.appendChild(innerContainer);
                        newLength--;
                    }

                    else if (postContainer.children.length == 3) {
                        postContainer = document.createElement("div");
                        postContainer.classList = "post-container";
                        innerContainer = document.createElement("div");
                        innerContainer.classList = "inner-container";
                        column = document.createElement("div");
                        column.classList = "column";
                        img = document.createElement("img");
                        img.classList = "post";
                        img.src = "static/uploads/" + image["post_address"];
                        column.appendChild(img);
                        input = document.createElement("input");
                        input.setAttribute("type", "hidden");
                        input.setAttribute("value", image["id"]);
                        column.appendChild(input);
                        column.setAttribute("onclick", "imgViewer(event)")
                        innerContainer.appendChild(column);
                        postContainer.appendChild(innerContainer);
                    }

                    else {
                        innerContainer = document.createElement("div");
                        innerContainer.classList = "inner-container";
                        column = document.createElement("div");
                        column.classList = "column";
                        img = document.createElement("img");
                        img.classList = "post";
                        img.src = "static/uploads/" + image["post_address"];
                        column.appendChild(img);
                        input = document.createElement("input");
                        input.setAttribute("value", image["id"]);
                        input.setAttribute("type", "hidden");
                        column.appendChild(input);
                        column.setAttribute("onclick", "imgViewer(event)")
                        innerContainer.appendChild(column);
                        postContainer.appendChild(innerContainer);
                        postsSection.appendChild(postContainer);
                    }
                }       
            }

            else {
                postsSection.style.marginBottom = "400px";
            }

            var remainder = 3 * Math.ceil(length / 3) - length;
            
            for (var i = 0; i < remainder; i++) {
                innerContainer = document.createElement("div");
                innerContainer.classList = "inner-container";
                column = document.createElement("div");
                column.classList = "column";
                innerContainer.appendChild(column);
                postContainer.appendChild(innerContainer);
                postsSection.appendChild(postContainer);
            }
        }
    }

    data = JSON.stringify({
        "name": name
    });

    aj.open("POST", "/get_posts", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function imgViewer(event) {

    var imgViewer = document.querySelector(".img-viewer"),
    dismiss = document.querySelector(".bi-x"),
    postImg = document.querySelector(".post-img"),
    comments = document.querySelector(".comments"),
    send = document.querySelector("#send"),
    comment = document.querySelector("#comment"),
    heart = document.querySelector(".bi-heart"),
    heartFill = document.querySelector(".bi-heart-fill"),
    likes = document.querySelector(".likes-count"),
    deleteBtn = document.querySelector(".delete");
    menu = document.querySelector(".bi-three-dots-vertical"),
    postOptions = document.querySelector("#post-options"),
    likedBy = document.querySelector(".liked-by"),
    likesList = document.querySelector(".likes-list"),
    likedByDismiss = document.querySelector(".dismiss"),
    cancel = document.querySelector("#post-cancel"),
    likesBtn = document.querySelector(".likes"),
    body = document.querySelector("body"),
    id = event.path[1].childNodes[1].value,
    arr = event.target.src.split("/");

    imgViewer.style.display = "flex";
    body.style.overflow = "hidden";
    postImg.src = event.target.src;

    getCaption(id);

    displayComments(id, "posts", comments);
    
    likedByUser(arr[5]);
    
    cancel.addEventListener("click", () => {
        postOptions.style.display = "none";
    });
    
    dismiss.addEventListener("click", () => {
        imgViewer.style.display = "none";
        postOptions.style.display = "none";
        body.style.overflow = "auto";
    });

    send.addEventListener("click", () => {
        
       if (comment.value.length > 0) {
            addComment(id, "posts", comment.value);
            displayComments(id, "posts", comments);
        }
    });

    heart.addEventListener("click", () => {
        heart.style.display = "none";
        heartFill.style.display = "inline-block";
        likes.innerHTML = Number(likes.innerHTML) + 1;
        increaseLikes(id, "posts");
    });

    heartFill.addEventListener("click", () => {
        heartFill.style.display = "none";
        heart.style.display = "inline-block";
        likes.innerHTML = Number(likes.innerHTML) - 1;
        decreaseLikes(id, "posts");
    });

    menu.addEventListener("click", () => {
        postOptions.style.display = "flex";
    });

    likesBtn.addEventListener("click", event => {
        displayLikes(id, "posts");
    });

    likedByDismiss.addEventListener("click", () => {

        likedBy.style.display = "none";
    });

    deleteBtn.addEventListener("click", () => {
        deleteContent(id, "posts");
    });
    
}

function post() {

    username = document.querySelector(".username");
    
    if (window.innerWidth > 480) {
        getPostsForLargeDevices(username.innerHTML);
    }
    else {
        getPosts(username.innerHTML);
    }
}



function getCaption(id) {

    var aj = new XMLHttpRequest,
    caption = document.querySelector(".caption-content");

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {
            response = JSON.parse(this.response);
            caption.innerHTML = response[0].caption;
        }
    }

    data = JSON.stringify({
        "id": id
    });

    aj.open("POST", "get_caption", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function likedByUser(address) {

    var aj = new XMLHttpRequest,
    heart = document.querySelector(".bi-heart"),
    heartFill = document.querySelector(".bi-heart-fill");

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {
            response = JSON.parse(this.response);
            if (response.results == "True") {
                heartFill.style.display = "inline-block";
                heart.style.display = "none";
            }
            else {
                heart.style.display = "inline-block";
                heartFill.style.display = "none";
            }
            likesCount(address);
        }
    }

    data = JSON.stringify({
        "address": address,
        "type": "posts"
    });

    aj.open("POST", "liked_by", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function likesCount(address) {

    var aj = new XMLHttpRequest,
    likes = document.querySelector(".likes-count");

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {
            response = JSON.parse(this.response);
            likes.innerHTML = response[0].likes + " Likes";
        }
    }

    data = JSON.stringify({
        "address": address
    });

    aj.open("POST", "likes_count", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function increaseLikes(id, type) {

    // Start xhr
    var aj = new XMLHttpRequest();

    // Set on readystatechange
    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {}
    }

    // Declare data
    data = JSON.stringify({
        "id": id,
        "type": type     
    });

    // Open request
    aj.open("POST", "/increase_likes", true);

    // Set Request Header
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    // Send data
    aj.send(data);
}

function decreaseLikes(id, type) {

    var aj = new XMLHttpRequest();

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {}
    }

    data = JSON.stringify({
        "id": id,
        "type": type
    });

    aj.open("POST", "/decrease_likes", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function deleteContent(id, type) {

    var aj = new XMLHttpRequest();

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {
            window.location.reload();
        }
    }

    data = JSON.stringify({
        "id": id,
        "type": type
    });

    aj.open("POST", "/delete", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function displayLikes(id, type) {

    var aj = new XMLHttpRequest(),
    likedBy = document.querySelector(".liked-by"),
    likesList = document.querySelector(".likes-list");

    while (likesList.children.length > 0) {
        likesList.removeChild(likesList.lastChild);
    }

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {

            let accounts = JSON.parse(this.response)[Symbol.iterator]();
            
            likedBy.style.display = "inline";
            
            for (account of accounts) {
                var div = document.createElement("div");
                div.classList = "account";
                var img = document.createElement("img");
                img.src = "static/uploads/" + account.image;
                var span = document.createElement("span");
                var username = document.createTextNode(account.username);
                span.appendChild(username);
                div.appendChild(img);
                div.appendChild(span);
                likesList.appendChild(div);
            }
        }
    }

    data = JSON.stringify({
        "id": id,
        "type": type
    });

    aj.open("POST", "/display_likes", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function addComment(id, type, comment) {
    
    var aj = new XMLHttpRequest();

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {}
    }

    data = JSON.stringify({
        "id": id,
        "type": type,
        "comment": comment
    });

    aj.open("POST", "/add_comment", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function displayComments(id, type, commentContainer) {

    var aj = new XMLHttpRequest();

    while (commentContainer.children.length > 0) {
        commentContainer.removeChild(commentContainer.lastChild);
    }

    aj.onreadystatechange = function () {
        if (aj.readyState == 4 && aj.status == 200) {
    
           let comments = JSON.parse(this.response)[Symbol.iterator]();

           for (item of comments) {
                contentContainer = document.createElement("div");
                contentContainer.classList = "content-container";
                comment = document.createElement("div");
                comment.classList = "comment";
                picture = document.createElement("div");
                picture.classList = "picture";
                img = document.createElement("img");
                img.src = "static/uploads/" + item.image;
                picture.appendChild(img);
                content =  document.createElement("div");
                content.classList = "content";
                div = document.createElement("div");
                spanName = document.createElement("span");
                spanName.classList = "name";
                text = document.createTextNode(item.username)
                spanName.appendChild(text);
                text = document.createTextNode(item.comment);
                div.appendChild(spanName);
                div.appendChild(text);
                br = document.createElement("br");
                extraContent = document.createElement("div");
                extraContent.classList = "extra-content";
                content.appendChild(div);
                content.appendChild(br);
                comment.appendChild(picture);
                comment.appendChild(content);
                contentContainer.appendChild(comment);
                commentContainer.appendChild(contentContainer);
           }
        }
    }

    data = JSON.stringify({
        "id": id,
        "type": type,
    });

    aj.open("POST", "/display_comments", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function bug_report() {
    var dismiss = document.querySelector(".dismiss"),
    proceed = document.querySelector(".proceed"),
    modal = document.querySelector(".modal");

    dismiss.addEventListener("click", () => {
        modal.style.display = "none";
    });

    proceed.addEventListener("click", () => {
        window.location.href = "/home";
    });
}

function journeys() {
    
    getPostsForJourneys();
    
}

function postInJourneysBehavior() {

    var heart = document.querySelectorAll(".bi-heart"),
    heartFill = document.querySelectorAll(".bi-heart-fill"),
    chat = document.querySelectorAll(".bi-chat-left"),
    post = document.querySelectorAll(".post"),
    tips = document.querySelector(".bi-lightbulb"),
    challenges = document.querySelector(".bi-lock"),
    caption = document.querySelectorAll(".caption");

    heart.forEach(item => {
        item.addEventListener("click", event => {
            postCount = event.path[2].childNodes[3];
            arr = postCount.innerHTML.split(" ");
            event.target.style.display = "none";
            event.path[1].childNodes[0].style.display = "inline-block";
            postCount.innerHTML = (Number(arr[0]) + 1) + " likes";
            increaseLikes(event.path[2].childNodes[4].value, "posts");
        });
    });

    heartFill.forEach(item => {
        item.addEventListener("click", event => {
            postCount = event.path[2].childNodes[3];
            arr = postCount.innerHTML.split(" ");
            event.target.style.display = "none";
            event.path[1].childNodes[1].style.display = "inline-block";
            postCount.innerHTML = (Number(arr[0]) - 1) + " likes";
            decreaseLikes(event.path[2].childNodes[4].value, "posts");
        });
    });

    chat.forEach(item => {
        item.addEventListener("click", event => {
            commentSection = event.path[2].childNodes[5];
            id = event.path[2].childNodes[4].value;
            commentsContainer = event.path[2].childNodes[5].childNodes[2];

            if (commentSection.style.display == "inline-block") {
                commentSection.style.display = "none";
            }
            else {
                commentSection.style.display = "inline-block";
                displayComments(id, "posts", commentsContainer);
            }
            
        });
    });

    post.forEach(item => {
        item.addEventListener("click", event => {

        comment = event.path[1].childNodes[0].value;
            
        addComment(id, "posts", comment);
        setTimeout(displayComments(id, "posts", commentsContainer), 2000);

        comment = "";
        
        });
    });

    caption.forEach(item => {
        item.addEventListener("click", event => {
            captionContainer = event.path[1].childNodes[7];
            if (captionContainer.style.display == "inline-block") {
                captionContainer.style.display = "none";
            } 
            else {
                captionContainer.style.display = "inline-block";
            }
            getCaption(event.path[1].childNodes[4].value)
        });
    });
 
    tips.addEventListener("click", () => {
        getTipsForJourneys();
    });

    challenges.addEventListener("click", () => {
        getChallengesForJourneys();
    })
    
}

function tipsInJourneysBehavior() {

    var heart = document.querySelectorAll(".bi-heart"),
    heartFill = document.querySelectorAll(".bi-heart-fill"),
    chat = document.querySelectorAll(".bi-chat-left"),
    post = document.querySelectorAll(".post");

    heart.forEach(item => {
        item.addEventListener("click", event => {
            event.target.style.display = "none";
            event.path[1].childNodes[1].style.display = "inline-block";
            increaseLikes(event.path[1].childNodes[3].value, "tips");
        });
    });

    heartFill.forEach(item => {
        item.addEventListener("click", event => {
            event.target.style.display = "none";
            event.path[1].childNodes[0].style.display = "inline-block";
            decreaseLikes(event.path[1].childNodes[3].value, "tips");
        });
    });

    chat.forEach(item => {
        item.addEventListener("click", event => {
            commentSection = event.path[3].childNodes[2],
            commentContainer = event.path[3].childNodes[2].childNodes[2];
            id = event.path[1].childNodes[3].value;
            
            if (commentSection.style.display == "inline-block") {
                commentSection.style.display = "none";
            }
            else {
                commentSection.style.display = "inline-block";
                displayComments(id, "tips", commentContainer);
            } 
        });
    });
    
    post.forEach(item => {
        item.addEventListener("click", event => {
            addComment(id, "tips", event.path[1].childNodes[0].value);
            event.path[1].childNodes[0].value = "";
            setInterval(displayComments(id, "tips", commentContainer), 2000);
        })
    })
    
}

function challengesInJourneysBehavior() {
    var person = document.querySelectorAll(".bi-person-plus"),
    personFill = document.querySelectorAll(".bi-person-plus-fill");

    person.forEach(item => {
        item.addEventListener("click", event => {
            event.target.style.display = "none";
            event.path[1].childNodes[1].style.display = "inline-block";
            increaseLikes(event.path[1].childNodes[2].value, "challenges");
        });
    });

    personFill.forEach(item => {
        item.addEventListener("click", event => {
            event.target.style.display = "none";
            event.path[1].childNodes[0].style.display = "inline-block";
            decreaseLikes(event.path[1].childNodes[2].value, "challenges");
        });
    });
}

function getPostsForJourneys() {

    var aj = new XMLHttpRequest,
    journeys = document.querySelector(".journeys-content");

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {

            response = JSON.parse(this.response)[Symbol.iterator]();

            for (item of response) {
                author = document.createElement("div");
                author.classList = "author";
                img = document.createElement("img");
                img.src = "static/uploads/" + item["image"];
                img.alt = "profile";
                span = document.createElement("span");
                span.classList = "username";
                span.innerHTML = item["username"];
                author.appendChild(img);
                author.appendChild(span);
                postImage = document.createElement("img");
                postImage.src = "static/uploads/" + item["post_address"];
                postImage.alt = "post";
                div = document.createElement("div");
                heartFill = document.createElement("i");
                heart = document.createElement("i");
                

                if (checkLike(item["post_address"], "posts")) {
                    heart.classList = "bi bi-heart none";
                    heartFill.classList = "bi bi-heart-fill";
                    div.appendChild(heartFill);
                    div.appendChild(heart);
                }
                else {
                    heartFill.classList = "bi bi-heart-fill none";
                    heart.classList = "bi bi-heart";
                    div.appendChild(heartFill);
                    div.appendChild(heart);
                }

                chat = document.createElement("i");
                chat.classList = "bi bi-chat-left";
                div.appendChild(chat);
                likes = document.createElement("div");
                likes.classList = "likes-count";
                likes.innerHTML = item["likes"] + " likes";

                input = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute("value", item["id"]);

                commentSection = document.createElement("div");
                commentSection.classList = "comment-section";
                addCommentInput = document.createElement("div");
                addCommentInput.classList = "add-comment";
                textarea = document.createElement("textarea");
                textarea.setAttribute("placeholder", "Add a comment");
                postComment = document.createElement("div");
                postComment.classList = "post";
                postComment.innerHTML = "Post";
                addCommentInput.appendChild(textarea);
                addCommentInput.appendChild(postComment);
                hr = document.createElement("hr");
                commentsContainer = document.createElement("div");
                commentsContainer.classList = "comments-container";
                commentSection.appendChild(addCommentInput);
                commentSection.appendChild(hr);
                commentSection.appendChild(commentsContainer);
                
                postWrapper = document.createElement("div");
                postWrapper.classList = "post-wrapper";
                postWrapper.appendChild(author);
                postWrapper.appendChild(postImage);
     
                postWrapper.appendChild(div);
                postWrapper.appendChild(likes);
                postWrapper.appendChild(input);
                postWrapper.appendChild(commentSection);

                if (item["caption"]) {
                    caption = document.createElement("div");
                    caption.classList = "caption";
                    caption.innerHTML = "caption...";
                    card = document.createElement("div");
                    card.classList = "caption-content none";
                    postWrapper.appendChild(caption);
                    postWrapper.appendChild(card);
                }
                
                journeys.appendChild(postWrapper);
            } 

            postInJourneysBehavior();
        }
    }

    data = JSON.stringify({
        "type": "posts"
    });

    
    aj.open("POST", "/fetch_all", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
    
}

function getTipsForJourneys() {

    var aj = new XMLHttpRequest,
    journeys = document.querySelector(".journeys-content");

    while (journeys.children.length > 0) {
        journeys.removeChild(journeys.lastChild);
    }

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {

            let response = JSON.parse(this.response)[Symbol.iterator]();
            
            for (item of response) {
                author = document.createElement("div");
                author.classList = "author";
                image = document.createElement("img");
                image.src = "static/uploads/" + item["image"];
                image.alt = "profile";
                span = document.createElement("span");
                span.classList = "username";
                span.innerHTML = item["username"];
                author.appendChild(image);
                author.appendChild(span);
                
                card = document.createElement("div");
                card.classList = "card";
                content = document.createElement("div");
                content.classList = "content";
                content.innerHTML = item["tip"];
                engagement = document.createElement("div");
                engagement.classList = "engagement";
                postedOn = document.createElement("div");
                postedOn.classList = "tip-posted-on";
                postedOn.innerHTML = "Day " + (calcDate(item["started_on"]) - calcDate(item["posted_on"]));
                div = document.createElement("div");

                heart = document.createElement("i");
                heartFill = document.createElement("i");
                
                if (checkLike(item["id"], "tips")) {
                    heartFill.classList = "bi bi-heart-fill";
                    heart.classList = "bi bi-heart none";
                } 
                else {
                    heart.classList = "bi bi-heart";
                    heartFill.classList = "bi bi-heart-fill none";
                }

                chat = document.createElement("i");
                chat.classList = "bi bi-chat-left";
                input = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute("value", item["id"]);

                commentSection = document.createElement("div");
                commentSection.classList = "comment-section";
                addCommentInput = document.createElement("div");
                addCommentInput.classList = "add-comment";
                textarea = document.createElement("textarea");
                textarea.setAttribute("placeholder", "Add a comment");
                postComment = document.createElement("div");
                postComment.classList = "post";
                postComment.innerHTML = "Post";
                addCommentInput.appendChild(textarea);
                addCommentInput.appendChild(postComment);
                hr = document.createElement("hr");
                commentsContainer = document.createElement("div");
                commentsContainer.classList = "comments-container";
                commentSection.appendChild(addCommentInput);
                commentSection.appendChild(hr);
                commentSection.appendChild(commentsContainer);
                
                div.appendChild(heart);
                div.appendChild(heartFill);
                div.appendChild(chat);
                div.appendChild(input);
                engagement.appendChild(postedOn);
                engagement.appendChild(div);
                card.appendChild(content);
                card.appendChild(engagement);
                card.appendChild(commentSection);
                journeys.appendChild(author);
                journeys.appendChild(card);
            }
            tipsInJourneysBehavior();
        }
    }

    data = JSON.stringify({
        "type": "tips"
    });

    
    aj.open("POST", "/fetch_all", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}

function getChallengesForJourneys() {

    let aj = new XMLHttpRequest,
    journeys = document.querySelector(".journeys-content");

    while (journeys.children.length > 0) {
        journeys.removeChild(journeys.lastChild);
    }

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {
            response = JSON.parse(this.response)[Symbol.iterator]();

            for (item of response) {
                author = document.createElement("div");
                author.classList = "author";
                image = document.createElement("img");
                image.src = "static/uploads/" + item["image"];
                image.alt = "profile";
                span = document.createElement("span");
                span.classList = "username";
                span.innerHTML = item["username"];
                author.appendChild(image);
                author.appendChild(span);
                
                card = document.createElement("div");
                card.classList = "card";
                content = document.createElement("div");
                content.classList = "content";
                content.innerHTML = item["challenge"];
                engagement = document.createElement("div");
                engagement.classList = "engagement";
                postedOn = document.createElement("div");
                postedOn.classList = "tip-posted-on";
                postedOn.innerHTML = "Day " + (calcDate(item["started_on"]) - calcDate(item["posted_on"]));
                div = document.createElement("div");

                person = document.createElement("i");
                personFill = document.createElement("i");
                
                if (checkLike(item["id"], "challenges")) {
                    personFill.classList = "bi bi-person-plus-fill";
                    person.classList = "bi bi-person-plus none";
                } 
                else {
                    person.classList = "bi bi-person-plus";
                    personFill.classList = "bi bi-person-plus-fill none";
                }

                input = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute("value", item["id"]);
                
                div.appendChild(person);
                div.appendChild(personFill);
                div.appendChild(input);
                engagement.appendChild(postedOn);
                engagement.appendChild(div);
                card.appendChild(content);
                card.appendChild(engagement);
                journeys.appendChild(author);
                journeys.appendChild(card);
            }
            challengesInJourneysBehavior();
        }
    }

    data = JSON.stringify({
        "type": "challenges"
    });

    
    aj.open("POST", "/fetch_all", true);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);
}


function checkLike(address, type) {

    var aj = new XMLHttpRequest;

    aj.onreadystatechange = function() {
        if (aj.readyState == 4 && aj.status == 200) {
            response = JSON.parse(this.response);
            if (response.results == "True") {
                result = true;
            }
            else {
                result = false;
            }
        }
    }

    data = JSON.stringify({
        "type": type,
        "address": address
    });

    aj.open("POST", "liked_by", false);
    aj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    aj.send(data);

    return result;
}

function calcDate(start) {
    start = start.split("-");

    date1 = new Date;
    date2 = new Date(start[0], start[1] - 1, start[2]);

    day = (date1 - date2) / (1000 * 60 * 60 * 24);

    return Math.floor(day);
}

function calcChallenge(level) {

    switch(level) {
        case 1:
            return 50;

        case 2:
            return 75;

        case 3:
            return 100;
    }
}

function calcHours(date, hours) {
    return calcDate(date) * hours;
}