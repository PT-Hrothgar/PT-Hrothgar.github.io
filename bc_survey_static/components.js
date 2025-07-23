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

document.addEventListener('DOMContentLoaded', function() {
  for (let acc of document.getElementsByClassName('accordion')) {
    acc.addEventListener('click', function() {
      this.classList.toggle('active');

      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } 
    });
  }

  for (let elem of document.getElementsByClassName('accordion-before')) {
    let next = elem.nextSibling, spacer = document.createElement('span');
    spacer.classList.add('accordion-spacer');
    elem.parentNode.insertBefore(spacer, next);
  }
});