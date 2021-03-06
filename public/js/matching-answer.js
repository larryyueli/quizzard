/*
Copyright (C) 2016
Developed at University of Toronto

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var matchAnswerCount = 3; // default number of options

// Answering Variables
var answeredId = 0;
var answerList = [];
var currentSelected = null;

/**
* Adds an option to the matching
*/
var addMatchAnswers = function(dom) {
    matchAnswerCount++;
    var inputdiv = '<div class="row"><hr><div class="col s5"><div class="card white"><textarea class="form-control" name="matchLeft{0}" placeholder="Enter Left Side" rows="3" required="required"></textarea></div></div><div class="col s5"><div class="card white"><textarea class="form-control" name="matchRight{0}" placeholder="Enter Right Side" rows="3" required="required"></textarea></div></div><div class="col s2"><a class="btn-floating btn-tiny waves-effect waves-light red" onclick="$(this).parent().parent().remove()"><i class="tiny material-icons">close</i></a></div></div>';
    inputdiv = inputdiv.format([matchAnswerCount]);
    $('#qAnswer > div.form-group').append(inputdiv);
}

/**
* Changes the colour of the card when hovering over it
*/
var cardHoverOn = function(card) {
    if (card[0].style.backgroundColor !== colours.grayLight){
        card[0].style.backgroundColor = colours.blueLight;
    }
}

/**
* Changes the colour of the card when un-hovering from it
*/
var cardHoverAway = function(card) {
    if (card[0].style.backgroundColor !== colours.grayLight){
        card[0].style.backgroundColor = colours.white;
    }
}

/**
* Selects the answer that the user clicks on. This function figures out the logic between
* selecting a card on the same side or a different side
*/
var selectAnswer = function(newItem) {
    var location = null;

    if (currentSelected) {
        // If selecting the same item
        if (currentSelected.attr('id') === newItem.attr('id')) {
            newItem[0].style.backgroundColor = colours.white;
            currentSelected = null;
            return;
        }

        // Which side was selected
        if (newItem.attr('id').indexOf('Left') !== -1) {
            location = 'Left';
        } else {
            location = 'Right';
        }

        currentSelected[0].style.backgroundColor = colours.white;

        // Is it the same side as the one previously selected
        if (currentSelected.attr('id').indexOf(location) !== -1) {
            newItem[0].style.backgroundColor = colours.grayLight;
            currentSelected = newItem;
        } else {
            newItem[0].style.backgroundColor = colours.white;

            if (location === 'Left') {
                createMatch(newItem, currentSelected);
            } else {
                createMatch(currentSelected, newItem);
            }
        }
    } else {
      newItem[0].style.backgroundColor = colours.grayLight;
      currentSelected = newItem;
    }
}

/**
* Marks the two cards selected as a match, and displays it appropriately to the user
*/
var createMatch = function(item1, item2) {
    $('#noAnswers').addClass('hidden');
    $('#clearBtn').removeClass('hidden');
    currentSelected = null;
    item1.addClass('hidden');
    item2.addClass('hidden');
    answerList.push(answeredId);
    var inputdiv = '<div class="row"><div class="col s5"><div class="card white"><p name="originalLeft{3}" id="ansLeft{0}">{1}</p></div></div><div class="col s5"><div class="card white"><p name="originalRight{4}" id="ansRight{0}">{2}</p></div></div><div class="col s2"><a class="btn-floating btn-tiny waves-effect waves-light red" id="delete{0}" onclick="deleteMatch($(this))"><i class="tiny material-icons">close</i></a></div></div>';
    inputdiv = inputdiv.format([answeredId, item1.text(), item2.text(), item1.attr('id'), item2.attr('id')]);
    $('#answers').append(inputdiv);
    answeredId++;
}

/**
* Deletes a match if the user hits the "X" button
*/
var deleteMatch = function(deleteButton) {
    var deleteAt = answerList.indexOf(parseInt(deleteButton.attr('id').replace('delete', '')));

    if (deleteAt > -1) {
        answerList.splice(deleteAt, 1);
    }

    $('#' + $('#ansLeft' + deleteButton.attr('id').replace('delete', '')).attr('name').replace('originalLeft', '')).removeClass('hidden');
    $('#' + $('#ansRight' + deleteButton.attr('id').replace('delete', '')).attr('name').replace('originalRight', '')).removeClass('hidden');
    deleteButton.parent().parent().remove();

    if(answerList.length === 0) {
        $('#noAnswers').removeClass('hidden');
        $('#clearBtn').addClass('hidden');
    }
}

/**
* Deletes all currently selected matches
*/
var clearAll = function() {
    while (answerList.length > 0) {
      deleteMatch($('#delete' + answerList[0]));
    }
}
