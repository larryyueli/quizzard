/*
The dataGenerator script

Copyright (C) 2016  Alexei Frolov, Larry Zhang
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

var logger = require('./server/log.js').logger;
var db = require('./server/db.js');
var users = require('./server/users.js');
var questions = require('./server/questions.js');
var common = require('./server/common.js');
var names = require('./names.js');

// variables to control the genereated data
var numberOfEachQuestion = [2,2,2,2,2,2];
var adminsCount = 2;
var studentsCount = 10;
var questionsMaxValue = 20;
var questionsAttempts = 10;
var commentsPerQuestion = 3;
var commentActionsPerQuestion = 3;
var commentRepliesVotesPerQuestion = 3;

// Probabilities used in generating data
var commentPercentage = 50;
var commentActionPercentage = 50;
var questionsCorrectPercentage = 40;

// variables used by the script for different functionality
// Do NOT change the variables below
var allIds = [];
var totalNumberOfQuestions = 0;
var questionsCount = 0;
var questionsIds = 0;
var numberOfQuestionsExpected = 0;
var adminsCreated = 0;
var studentsCreated = 0;
var questionsCreated = 0;
var questionsAnswered = 0;
var commentsAdded = 0;
var commentActionsAdded = 0;
var commentRepliesVotesAdded = 0;
var actualCommentsAdded = 0;
var actualRepliesAdded = 0;

/**
 * This function creates all the admins based on the variables
 */
var createAdmins = function() {
    for (var id = 0; id < adminsCount; id++) {
        addAdmin('Admin'+id, 'KonniChiwa');
    }
}

/**
 * This functions adds the accounts of admins
 * 
 * @param {integer} accid 
 * @param {string} pass 
 */
var addAdmin = function(accid, pass) {
    var acc = {
        id: accid,
        password: pass,
        fname: accid,
        lname: accid,
        email: accid+'@mail.utoronto.ca'
    };

    users.addAdmin(acc, function(err, account) {
        if (err) {
            logger.error('Could not create account %s. Please try again.', accid);
        } else if (err === 'exists') {
            logger.info('Account with username %s exists.', accid);
        }

        adminsCreated++;

        if (adminsCreated === adminsCount) {
            createStudents();
        }
    });
}

/**
 * This function creates all the students based on the variables
 */
var createStudents = function() {
    for (var id = 0; id < studentsCount; id++) {
        addStudent(names.namesList[id], studentIdGenerator(names.namesList[id]), 'KonniChiwa');
    }
}

/**
 * This functions adds the accounts of admins
 * 
 * @param {integer} accid 
 * @param {string} pass 
 */
var addStudent = function(name, accid, pass) {
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ')[1];

    var acc = {
        id: accid,
        password: pass,
        fname: firstName,
        lname:lastName,
        email: firstName + '.' + lastName +'@mail.utoronto.ca'
    };

    users.addStudent(acc, function(err, account) {
        if (err) {
            logger.error('Could not create account %s. Please try again.', accid);
        } else if (err === 'exists') {
            logger.info('Account with username %s exists.', accid);
        }

        studentsCreated++;

        if(studentsCreated === studentsCount) {
            createQuestionsRegular();
        }
    });
}

/**
 * This function creates all the regular type question based on the variables
 */
var createQuestionsRegular = function() {
    variableReset(0);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionRegular('Is math related to science? '+id, id);
  	}
}

/**
 * This function adds the regular type question
 * 
 * @param {string} qTopic 
 * @param {integer} id 
 */
var addQuestionRegular = function(qTopic, id) {
	var question = {
		topic: 'CSC492',
		title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'KonniChiwa',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.REGULAR.value,
        hint: 'KonniChiwa',
        visible: 'true'
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, 'Admin'+i, Math.floor(Math.random()*6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsRegular();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the regular type question based on the variables
 */
var answerQuestionsRegular = function() {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionRegular(id);
    }
}

/**
 * This function answers the regular type question
 * 
 * @param {integer} questionId 
 */
var answerQuestionRegular = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = allIds[Math.floor(Math.random()*studentsCount)];
        var answer = 'NotKonniChiwa';

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = 'KonniChiwa';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered === numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsMultipleChoice();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the multiple choice type question based on the variables
 */
var createQuestionsMultipleChoice = function() {
    variableReset(1);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionMultipleChoice('Is math related to science? '+id, id);
  	}
}

/**
 * This function adds the multiple choice type question
 * 
 * @param {string} qTopic 
 * @param {integer} id 
 */
var addQuestionMultipleChoice = function(qTopic, id) {
	var question = {
	    topic: 'CSC492',
		title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'Option1',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.MULTIPLECHOICE.value,
        hint: 'Option1',
        visible: 'true',
        choices: ['Option1','Option2','Option3','Option4']
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, 'Admin'+i, Math.floor(Math.random()*6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsMultipleChoice();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the multiple choice type question based on the variables
 */
var answerQuestionsMultipleChoice = function() {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionMultipleChoice(id);
    }
}

/**
 * This function answers the multiple choice type question
 * 
 * @param {integer} questionId 
 */
var answerQuestionMultipleChoice = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = allIds[Math.floor(Math.random()*studentsCount)];
        var answer = 'Option2';

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = 'Option1';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered === numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsTrueFalse();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the true and false type question based on the variables
 */
var createQuestionsTrueFalse = function() {
    variableReset(2);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionTrueFalse('Is math related to science? '+id, id);
  	}
}

/**
 * This function adds the true and false type question
 * 
 * @param {string} qTopic 
 * @param {integer} id 
 */
var addQuestionTrueFalse = function(qTopic, id) {
	var question = {
		topic: 'CSC492',
		title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'true',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.TRUEFALSE.value,
        hint: 'Option1',
        visible: 'true'
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, 'Admin'+i, Math.floor(Math.random()*6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsTrueFalse();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the true and false type question based on the variables
 */
var answerQuestionsTrueFalse = function() {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionTrueFalse(id);
    }
}

/**
 * This function answers the true and false type question
 * 
 * @param {integer} questionId 
 */
var answerQuestionTrueFalse = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = allIds[Math.floor(Math.random()*studentsCount)];
        var answer = 'false';

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = 'true';
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered === numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsMatching();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the matching type question based on the variables
 */
var createQuestionsMatching = function() {
    variableReset(3);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionMatching('Is math related to science? '+id, id);
  	}
}

/**
 * This function adds the matching type question
 * 
 * @param {string} qTopic 
 * @param {integer} id 
 */
var addQuestionMatching = function(qTopic, id) {
	var question = {
		topic: 'CSC492',
		title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: 'true',
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.MATCHING.value,
        hint: 'Option1',
        visible: 'true',
        leftSide: ['l1', 'l2', 'l3'],
        rightSide: ['r1', 'r2', 'r3']
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, 'Admin'+i, Math.floor(Math.random()*6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsMatching();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the matching type question based on the variables
 */
var answerQuestionsMatching = function() {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionMatching(id);
    }
}

/**
 * This function answers the matching type question
 * 
 * @param {integer} questionId 
 */
var answerQuestionMatching = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = allIds[Math.floor(Math.random()*studentsCount)];
        var answer = [['l3', 'l2', 'l1'], ['r1', 'r2', 'r3']];

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = [['l1', 'l2', 'l3'], ['r1', 'r2', 'r3']];
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered === numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsChooseAll();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the choose all type question based on the variables
 */
var createQuestionsChooseAll = function() {
    variableReset(4);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionChooseAll('Is math related to science? '+id, id);
  	}
}

/**
 * This function adds the choose all type question
 * 
 * @param {string} qTopic 
 * @param {integer} id 
 */
var addQuestionChooseAll = function(qTopic, id) {
	var question = {
		topic: 'CSC492',
		title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: ['c1', 'c2', 'c4'],
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.CHOOSEALL.value,
        hint: 'Option1',
        visible: 'true',
        choices: ['c1', 'c2', 'c3', 'c4']
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, 'Admin'+i, Math.floor(Math.random()*6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsChooseAll();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the choose all type question based on the variables
 */
var answerQuestionsChooseAll = function() {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionChooseAll(id);
    }
}

/**
 * This function answers the choose all type question
 * 
 * @param {integer} questionId 
 */
var answerQuestionChooseAll = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = allIds[Math.floor(Math.random()*studentsCount)];
        var answer = ['c1', 'c2', 'c3'];

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = ['c1', 'c2', 'c4'];
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered === numberOfQuestionsExpected*questionsAttempts) {
                createQuestionsOrdering();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates all the ordering type question based on the variables
 */
var createQuestionsOrdering = function() {
    variableReset(5);
  	for (var id = questionsIds; id < questionsCount; id++) {
      	addQuestionOrdering('Is math related to science? '+id, id);
  	}
}

/**
 * This function adds the ordering type question
 * 
 * @param {string} qTopic 
 * @param {integer} id 
 */
var addQuestionOrdering = function(qTopic, id) {
    var question = {
		topic: 'CSC492',
		title: qTopic,
        text: '<p>'+qTopic+' Text</p>',
        answer: ['i1', 'i2', 'i3', 'c4'],
        points: Math.floor(Math.random()*questionsMaxValue),
        type: common.questionTypes.ORDERING.value,
        hint: 'Option1',
        visible: 'true'
    };

    questions.addQuestion(question, function(err, res) {
        if (err) {
            logger.error('Could not add question. Please try again.');
        } else {
            logger.info('Questions %d created', id);

            for (var i = 0; i < adminsCount; i++) {
                rateQuestion(id, 'Admin'+i, Math.floor(Math.random()*6));
            }
        }

        if (questionsCreated === numberOfQuestionsExpected) {
            answerQuestionsOrdering();
        }

        questionsCreated++;
    });
}

/**
 * This function answers all the ordering type question based on the variables
 */
var answerQuestionsOrdering = function() {
    for (var id = questionsIds; id < questionsCount; id++) {
        answerQuestionOrdering(id);
    }
}

/**
 * This function answers the ordering type question
 * 
 * @param {integer} questionId 
 */
var answerQuestionOrdering = function(questionId) {
    for (var i = 0; i < questionsAttempts; i++) {
        var studentId = allIds[Math.floor(Math.random()*studentsCount)];
        var answer = ['i1', 'i2', 'i3', 'c4'];

        if (Math.floor(Math.random()*100) > (100-questionsCorrectPercentage)) {
            answer = ['i1', 'i3', 'i2', 'c4'];
        }

        checkAnswer(questionId, studentId, answer, function (err, correct) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Questions %d answered %s by %s', questionId, correct? 'correctly' : 'incorrectly', studentId);
            }

            if (questionsAnswered === numberOfQuestionsExpected*questionsAttempts) {
                createComments();
            }

            questionsAnswered++;
        });
    }
}

/**
 * This function creates the comments on all the questions
 */
var createComments = function() {
    for (var id = 1; id <= totalNumberOfQuestions; id++) {
        logger.info('Creating comments for question %d', id);
        addComments(id, function(err, res) {});
    }
}

/**
 * This function adds a number of comments to a given question based on
 * the number specified. It selects a random student to comment
 * 
 * @param {integer} questionId 
 * @param {function} callback 
 */
var addComments = function(questionId, callback) {
    db.lookupQuestion({id: questionId}, function(err, question) {
        questionId = question._id;
        if(err) {
            return callback(err, null);
        } else if(!question) {
            return callback('Could not find the question', null);
        } else {
            var answeredList = [];

            for (var i in question.correctAttempts) {
                answeredList.push(question.correctAttempts[i].id);
            }

            for (var i = 0; i < commentsPerQuestion; i++) {
                if (Math.floor(Math.random()*100) > (100-commentPercentage)) {
                    userId = answeredList[Math.floor(Math.random()*answeredList.length)];
                    comment = 'this is some lorem ipsum';

                    questions.addComment(questionId, userId, comment, function(err, res) {
                        if (err) {
                            return callback (err, null);
                        } else {
                            actualCommentsAdded++;
                        }

                        commentsAdded++;

                        if (commentsAdded === totalNumberOfQuestions*commentsPerQuestion) {
                            createCommentActions();
                        }
                    });
                } else {
                    commentsAdded++;

                    if (commentsAdded === totalNumberOfQuestions*commentsPerQuestion) {
                        createCommentActions();
                    }
                }

            }
        }
    });
}

/**
 * This function creates comment actions, such as likes, dislikes, and replies.
 * It uses the globally defined settings to do so
 */
var createCommentActions = function() {
    for (var id = 1; id <= totalNumberOfQuestions; id++) {
        addCommentActions(id, function(err, res) {});
    }
}

/**
 * This function adds the action comments to the question specified
 * 
 * @param {integer} questionId 
 * @param {function} callback 
 */
var addCommentActions = function(questionId, callback) {
    db.lookupQuestion({id: questionId}, function(err, question) {
        questionId = question._id;
        if(err) {
            return callback(err, null);
        } else if(!question) {
            return callback('Could not find the question', null);
        } else {
            var answeredList = [];

            for (var i in question.correctAttempts) {
                answeredList.push(question.correctAttempts[i].id);
            }

            for (var j = 0; j < question.comments.length; j++) {
                for (var i = 0; i < commentActionsPerQuestion; i++) {
                    if (Math.floor(Math.random()*100) > (100-commentActionPercentage)) {
                        userId = answeredList[Math.floor(Math.random()*answeredList.length)];
                        let vote = (Math.random() < 0.5) ? -1 : 1;

                        questions.voteComment(question.comments[j]._id, vote, userId, function(err, res) {
                            if (err) {
                                return callback (err, null);
                            }

                            commentActionsAdded++;
                            if (commentActionsAdded === 2*commentActionsPerQuestion*actualCommentsAdded) {
                                createReplyActions();
                            }
                        });

                        let reply = 'This is some random lorem ipsum reply that I am typing here';

                        questions.addReply(question.comments[j]._id, userId, reply, function(err, res) {
                            if (err) {
                                return callback (err, null);
                            } else {
                                actualRepliesAdded++
                            }

                            commentActionsAdded++;

                            if (commentActionsAdded === 2*commentActionsPerQuestion*actualCommentsAdded) {
                                createReplyActions();
                            }
                        });
                    } else {
                        commentActionsAdded+=2;

                        if (commentActionsAdded === 2*commentActionsPerQuestion*actualCommentsAdded) {
                            createReplyActions();
                        }
                    }

                }
            }
        }
    });
}

/**
 * This function creates reply actions, such as likes, and dislikes.
 * It uses the globally defined settings to do so
 */
var createReplyActions = function() {
    for (var id = 1; id <= totalNumberOfQuestions; id++) {
        addReplyActions(id, function(err, res) {});
    }
}

/**
 * This function adds the action replies to the question specified
 * 
 * @param {integer} questionId 
 * @param {function} callback 
 */
var addReplyActions = function(questionId, callback) {
    db.lookupQuestion({id: questionId}, function(err, question) {
        questionId = question._id;
        if(err) {
            return callback(err, null);
        } else if(!question) {
            return callback('Could not find the question', null);
        } else {
            var answeredList = [];

            for (var i in question.correctAttempts) {
                answeredList.push(question.correctAttempts[i].id);
            }

            for (var j = 0; j < question.comments.length; j++) {
                for (var k = 0; k < question.comments[j].replies.length; k++) {
                    for (var i = 0; i < commentRepliesVotesPerQuestion; i++) {
                        commentRepliesVotesAdded++;

                        if (commentRepliesVotesAdded === commentRepliesVotesPerQuestion*actualRepliesAdded) {
                            setTimeout(function() {
                                process.exit(0);
                            }, 500);
                        }

                        if (Math.floor(Math.random()*100) > (100-commentActionPercentage)) {
                            userId = answeredList[Math.floor(Math.random()*answeredList.length)];
                            let vote = (Math.random() < 0.5) ? -1 : 1;

                            questions.voteReply(question.comments[j].replies[k]._id, vote, userId, function(err, res) {
                                if (err) {
                                    return callback (err, null);
                                }
                            });
                        }
                    }
                }
            }
        }
    });
}

/**
 * This function checks and answers the question specified, by the uer specified
 * 
 * @param {integer} questionId 
 * @param {string} userId 
 * @param {string} answer 
 * @param {function} callback 
 */
var checkAnswer = function (questionId, userId, answer, callback) {
    logger.info('User %s attempted to answer question %s with "%s"', userId, questionId, answer);

    db.lookupQuestion({id: questionId}, function(err, question) {
        questionId = question._id;
        if(err) {
            return callback(err, null);
        } else if(!question) {
            return callback('Could not find the question', null);
        } else {
            var value = questions.verifyAnswer(question, answer);
            var points = question.points;

            users.submitAnswer(
                userId, questionId, value, points, answer,
                function(err, res) {
                    if (err) {
                        return callback (err, null);
                    }

                    questions.submitAnswer(
                        questionId, userId, value, points, answer,
                        function(err, res) {
                            if (err) {
                                return callback (err, null);
                            }

                            if (value) {
                                rateQuestion(question.id, userId, Math.floor(Math.random()*6));
                            }

                            return callback (null, value);
                        }
                    );
                }
            );
        }
    });
}

/**
 * This function rates the question specifed, by the user specified, using the rating givem
 * 
 * @param {integer} questionId 
 * @param {string} userId 
 * @param {integer} rating 
 * @param {function} callback 
 */
var rateQuestion = function (questionId, userId, rating, callback) {
    if (rating < 1 || rating > 5) {
        return;
    }

    db.lookupQuestion({id: questionId}, function(err, question) {
        questionId = question._id;

        if(err) {
            return callback(err, null);
        } else if(!question) {
            return callback('Could not find the question', null);
        } else {
            questions.submitRating(questionId, userId, rating, function(err, res) {
                if (err) {
                    logger.error('Could not rate question. Please try again.');
                } else {
                    logger.info('Questions %d rated as %d', question.id, rating);
                }
            });
        }
    });
}

// This section includes the helper functions used for the generator
/**
 * This function gives the ID of the user formatted as the first 7 letters
 * of `lastFirst` naming convention
 * 
 * @param {string} name 
 */
var studentIdGenerator = function(name) {
    const combined = name.split(' ')[1] + name.split(' ')[0];
    var possibleIds = combined.slice(0,7).toLowerCase();
    allIds.push(possibleIds);
    return possibleIds;
}

/**
 * This function resets the variables that are needed for each question to be pupulated
 * 
 * @param {integer} number 
 */
var variableReset = function(number) {
    var totalCreated = 1;

    for (var i = 0; i < number; i++) {
        totalCreated += numberOfEachQuestion[i];
    }

    numberOfQuestionsExpected = numberOfEachQuestion[number];
    questionsCount = totalCreated + numberOfQuestionsExpected;
    questionsIds = totalCreated;
    questionsCreated = 1;
    questionsAnswered = 1;
}

/**
 * This function calculates the number of questions that need to be added
 */
var calculateTotalNumberOfQuestions = function() {
    var totalCreated = 0;
    
    for (var i = 0; i < numberOfEachQuestion.length; i++) {
        totalCreated += numberOfEachQuestion[i];
    }

    totalNumberOfQuestions = totalCreated;
}

db.initialize(function() {
    db.removeAllUsers(function(err, res) {
        if (err) {
            process.exit(1);
        }

        db.removeAllQuestions(function(err, res) {
            if (err) {
                process.exit(1);
            }

            calculateTotalNumberOfQuestions();
            createAdmins();
        });
    });
});
