let found_title = "";

function find(title, id) {
  const votes = document.getElementsByClassName("vote");
  let firstVote = null;

  for (let vote of votes) {
    if (vote.innerHTML == title && title != found_title) {
      vote.style.backgroundColor = "#cfc";

      if (firstVote === null) {
        firstVote = vote;
      }
    } else if (vote.innerHTML == "against " + title && title != found_title) {
      vote.style.backgroundColor = "#fcc";

      if (firstVote === null) {
        firstVote = vote;
      }
    } else {
       vote.style.backgroundColor = vote.parentNode.style.backgroundColor;
    }
  }
  
  const buttons = document.getElementsByClassName("find-votes");
  for (let button of buttons) {
    if (button.id == "button" + id && title != found_title) {
      button.innerHTML = "Hide votes";
    } else {
      button.innerHTML = "Find votes";
    }
  }

  if (title == found_title) {
    found_title = "";
  } else {
    found_title = title;
    
    if (firstVote === null) {
      document.getElementById("votes-table").scrollIntoView();
    } else {
      firstVote.scrollIntoView();
    }
  }
}

function post(path, args, callback) {
    let query = '', start = true;
    for (let a in args) {
        if (!start) {
            query += '&';
        }
        start = false;
        query += encodeURIComponent(a) + '=' + encodeURIComponent(args[a]);
    }
    const req = new XMLHttpRequest();
    req.onload = function() {
        callback(this);
    }
    ;
    req.open('POST', path, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    req.send(query);
}

function getCookie(name) {
    const val = name + '=', cookies = decodeURIComponent(document.cookie).split(';');
    for (let c of cookies) {
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(val.length, c.length);
        }
    }
    return '';
}

function startSuggestions(word, path) {
  const
    input = document.getElementById('id_' + word),
    suggestion = document.getElementById(word + '_suggestion'),
    accept = document.getElementById(word + '_accept'),
    reject = document.getElementById(word + '_reject');

  if (input !== null) {
    input.addEventListener('input', function() {
      if (this.value) {
        post(path, {content: this.value}, function(response) {
          if (response.status === 200) {
            if (response.responseText == input.value) {
              suggestion.innerHTML = '';
            } else {
              suggestion.innerHTML = response.responseText;
            }
          }
        });
      } else {
        suggestion.innerHTML = '';
      }
    });
  }
  if (accept !== null) {
    accept.addEventListener('click', function() {
      if (suggestion.innerHTML) {
        input.value = suggestion.innerHTML;
        suggestion.innerHTML = '';
        input.focus();
      }
    });
  }
  if (reject !== null) {
    reject.addEventListener('click', function() {
      suggestion.innerHTML = '';
      input.focus();
    })
  }
}

document.addEventListener('DOMContentLoaded', function() {
  for (let acc of document.getElementsByClassName('accordion')) {
    acc.addEventListener('click', function() {
      const panel = this.nextElementSibling;
      if (this.classList.contains('active')) {
        panel.style.maxHeight = null;
        this.classList.remove('active');
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        this.classList.add('active');
      } 
    });
  }

  for (let elem of document.getElementsByClassName('accordion-before')) {
    let next = elem.nextSibling, spacer = document.createElement('span');
    spacer.classList.add('accordion-spacer');
    elem.parentNode.insertBefore(spacer, next);
  }
  for (let x of document.querySelectorAll('form.confirm-submit')) {
    x.addEventListener('submit', function(e) {
      const title = x.getAttribute('data-target');
      const prompt = (title === null) ? 'Are you sure you want to delete your comment?' : 'Are you sure you want to delete your nomination "' + document.querySelector(title).getAttribute('data-label') + '"?';
      if (!confirm(prompt)) {
        e.preventDefault();
      }
    });
  }

  startSuggestions('title', capitalizeTitleUrl);
  startSuggestions('author', capitalizeAuthorUrl);

  let s = document.getElementById('id_sortmethod');
  if (s !== null) {
    s.addEventListener('change', function() {this.form.submit()});
  }

  if (document.getElementsByClassName('re-nominate').length) {
    for (let e of document.getElementsByClassName('re-nominate-only')) {
      e.style.display = 'block';
      e.style.visibility = 'visible';
    }
  }
});
