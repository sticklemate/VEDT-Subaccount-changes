/*
**  Remove points from Canvas Rubrics
**
**  Purpose/Description: 
**      Automatically remove all the points in a rubrics table
**
**  License: (MIT License? Apache License 2.0? GNU Affero General Public License v3.0?)
**      TBC (Refer to the license.md)
**  
**  Author(s):
**      Edwin Ang Ding Hou, 21CC Project, RMIT Univeristy
**      
**  Contributor(s):
**      
**
*/
$(document).ready(function() {
    // check if rubrics exist
    if ($('body.rubrics').length || $('body.assignments').length){
        // check if user is a student
//        if (typeof ENV.current_user_roles == "undefined" || typeof ENV.current_user_roles == undefined || typeof ENV.current_user_roles == null){
//            // get url path
//            var urlPath = window.location.pathname.split('/');
//            var courseID;
//
//            // get course id from url path 
//            for (var i=0;i<urlPath.length;i++){
//                if(urlPath[i]==='courses'){
//                    courseID = urlPath[i+1];
//                }
//            }
//            
//            $.ajax({
//                url: "https://rmit.instructure.com/api/v1/courses/"+courseID
//            })
//            .fail(function(error){
////                console.log('Error with API to get course name');
//            })
//            .done(function(data) {
//            });
//        }else{
//            var roles = ENV.current_user_roles;    
//        }
        
        removePoints();
    }
    
    function removePoints(){
        var rubricSelector = '#rubrics .rubric_container:not(.editing) .rubric_table ';
        
        // remove points table heading
        var thEl = $(rubricSelector+'thead th');
        for (var i=0;i<thEl.length;i++){
            var thText = thEl[i].innerText;
            if (thText.toLowerCase() === 'pts') {
                thEl[i].className = 'hide';
            }
        }
        
        // remove points from each criteria
        $(rubricSelector+'.criterion td.points_form').hide();
        
        // remove points in summary of table
        $(rubricSelector+'tr.summary .total_points_holder').hide();
        
        // remove points from each ratings
        $(rubricSelector+'.rating span.nobr').hide();
    }
});
/**  Course Progress Bar
**
**  Purpose/Description:
**      Shows the student's current progress in a course. This feature also display
**      the student's progress in a module, items in a module, state of each item
**      (completed/uncompleted), prerequisite if any and allows the student to jump
**      to a module or item
**
**  Reference(s):
**      course-progress-bar.scss - course progress bar style
**
**  License: (MIT License? Apache License 2.0? GNU Affero General Public License v3.0?)
**      TBC (Refer to the license.md)
**
**  Author(s):
**      Edwin Ang Ding Hou, 21CC Project, RMIT Univeristy
**
**  Contributor(s):
**      Nadia Joyce, R21CC Project - UI/UX design of course progress bar
**      Michael Grant, (michael.grant@rmit.edu.au), VE individualised Support Project
*/


$(document).ready(function() {
    if ($('#user-course-progress-bar.module-number-only').length){
        // get url path
        var urlPath = window.location.pathname.split('/');
        var courseID, moduleNo,moduleObj, isStudent;

        // get course id from url path
        for (var i=0;i<urlPath.length;i++){
            if(urlPath[i]==='courses'){
                courseID = urlPath[i+1];
                getModuleObj(courseID);
            }
        }

        // get the module object data with Canvas API
        function getModuleObj(courseID){
            // ensure that courseID exist before calling function
            if($.isNumeric(courseID)){
                $.ajax({
                    url: "https://rmit.instructure.com/api/v1/courses/"+courseID+"/modules?include=items&per_page=100"
                }).then(function(data) {
                    moduleObj = data;
                    moduleNo = moduleObj.length;

                    for (var i=0;i<moduleNo;i++){
                        var moduleState;
                        var moduleID = moduleObj[i]['id'];
                        var moduleName = moduleObj[i]['name'];
                        var itemURL = moduleObj[i]['items_url'];

                        // check for module state
                        //   user with teacher or designer role do not have state
                        if (moduleObj[i]['state']){
                            moduleState = moduleObj[i]['state'];
                        }else{
                            //console.log('teacher view');
                            moduleState = 'teacher';
                        }


                        // initiate building of progress bar and module detail shell
                        buildModuleShell((i+1),i, moduleState, moduleID, courseID, moduleName,moduleObj);
                    }

                    // function to handle the progress bar module button
                    //   show and hide module detail on click
                    $('.course-progress-module-container').on('click',function(moduleObj){
                        $('.course-progress-module-container').removeClass('active');
                        $(this).addClass('active');
                        var no = $(this).attr('data-module-no');

                        $('.specific-module-box');
                        setTimeout(function(){
                            $('.specific-module-box').removeClass('active');
                            $('.module-'+no+'-box').addClass('active');
                        });
                    });
                });
            }
        }

        // build the shell for progress bar and module detail
        function buildModuleShell (moduleDisplayNumber,moduleObjIndex, state,moduleID, courseID, moduleName, moduleObj){
            var icon,moduleStateClass,moduleDetailStatus,moduleURL,moduleStatus='', btntitle='', widthCSS='';
            moduleURL = 'https://rmit.instructure.com/courses/'+courseID+'/modules#module_'+moduleID+'';

            // Module Unlocked
            //   if user has teacher, designer role, module will be set as unlocked
            if (state === 'unlocked' || state === 'teacher'){
                icon = 'arrow-open-right'; // icon for the module state
                moduleStateClass = 'course-progress-module-open';
                moduleDetailStatus ='<h3 class="module-progress-percentage"></h3><p class="module-status">Not yet started</p>';
                btntitle='Explore module';
                widthCSS = 'width:0%;'; // width of the progress bar indicator
                moduleObj[moduleObjIndex]['progress']=0;

            // Module Started
            }else if (state === 'started'){
                icon = 'arrow-open-right';
                moduleStateClass = 'course-progress-module-open';
                moduleDetailStatus ='<h3 class="module-progress-percentage"></h3><p class="module-status">Completed</p>';
                btntitle='Explore module';
                moduleObj[moduleObjIndex]['progress']=0;

            // Module Completed
            }else if (state === 'completed'){
                icon = 'check';
                moduleStateClass = 'course-progress-module-complete';
                moduleDetailStatus ='<span class="module-progress-icon"><i class="icon-'+icon+'"></i></span><p class="module-status">Completed</p>';
                btntitle='Module complete';
                widthCSS = 'width:100%;'; // width of the progress bar indicator
                moduleObj[moduleObjIndex]['progress']=100;

            // Module Locked
            }else if (state === 'locked'){
                icon = 'lock';
                moduleStateClass = 'course-progress-module-locked';
                moduleDetailStatus ='<span class="module-progress-icon"><i class="icon-'+icon+'"></i></span><p class="module-status">Locked</p>';
                btntitle='Module locked';
                widthCSS = 'width:0%;'; // width of the progress bar indicator
                moduleStatus=' item-locked'; // class to reduce opacity of locked item
                moduleObj[moduleObjIndex]['progress']=0;
            }

           // progress bar shell
            $('.course-progress-container').append('<li><div class="card course-progress-module-container course-progress-module-'+moduleDisplayNumber+' '+moduleStateClass+'" data-module-no="'+moduleDisplayNumber+'"><div class="module-progress-status" style="'+widthCSS+'"></div><div class="course-progress-module-title-wrapper "><h4 class="card-title">'+moduleName+'</h4><a href="#module-container" class="btn">'+btntitle+' <i class="icon-'+icon+'"></i></a></div></div></li>');

            // module detail shell
            $(".module-item-container").append('<div class="specific-module-box module-'+moduleDisplayNumber+'-box"><div class="specific-module-details"><div class="module-container"><div class="module-details"><h3 class="specific-module-name">'+moduleName+'</h3><h4 class="specific-module-prerequisite"></h4><ul class="module-prerequisite-list"></ul></div><div class="module-status">'+moduleDetailStatus+'</div></div><ul class="item-container '+moduleStatus+'"></ul></div></div>');


            // add items into module detail
            addItemsIntoModuleBox(moduleObj, moduleObjIndex);

            // add prerequisite if the module progress have been determined
            if(moduleObj[moduleObjIndex]['prerequisite_module_ids'].length >0 && state !== 'started'){
                var preIdObj = moduleObj[moduleObjIndex]['prerequisite_module_ids'];
                addPrerequisite(moduleObj,moduleObjIndex,preIdObj);
            }

            // calculate the total course progress at the end of the iteration
            // but if the last module has a 'started' state, then calculate that module first
            if(moduleObjIndex === moduleObj.length-1 && state !== 'started'){
                calcTotalCourseProgress(moduleObj);

            // calculate the progress of the started module
            }else if (state === 'started'){
                calcStartedModuleProgress(moduleObj, moduleObjIndex);
            }


        }

        // add items into module detail
        function addItemsIntoModuleBox(moduleObj, i){
            var itemObj = moduleObj[i]['items'];
            var status = moduleObj[i]['state'];
            for(var k=0;k<itemObj.length;k++){
                var typeIcon, statusIcon,itemStatus,itemTypeStatusClass;

                // get the item type to determine the icon to insert
                if(itemObj[k]['type'] === 'Page'){
                    typeIcon = 'document';
                }else if(itemObj[k]['type'] === 'Assignment'){
                    typeIcon = 'assignment';
                }else if(itemObj[k]['type'] === 'Quiz'){
                    typeIcon = 'quiz';
                }else if(itemObj[k]['type'] === 'Discussion'){
                    typeIcon = 'discussion';
                }else if(itemObj[k]['type'] === 'ExternalUrl' || itemObj[k]['type'] ==='ExternalTool'){
                    typeIcon = 'link';
                }else if(itemObj[k]['type'] === 'File'){
                    typeIcon = 'download';
                }

                // check if item has 'completion_requirement' and 'completed' data
                //   only item with requirements has 'completion_requirement' data
                //   only user with student role includes 'completed' data
                if (itemObj[k]['completion_requirement']){
                    if(itemObj[k]['completion_requirement']['completed']){
                        statusIcon='check';
                        itemStatus = 'completed';
                        itemTypeStatusClass = ' item-completed';
                    }else{
                        statusIcon='empty';
                        itemStatus = '';
                        itemTypeStatusClass = '';
                    }
                }else{
                    statusIcon='empty';
                    itemStatus = '';
                    itemTypeStatusClass = '';
                }

                var itemLink = itemObj[k]['html_url'];
                var pageTitle = itemObj[k]['title'];
                var itemHTML;

                // if module is locked, item cannot be linked to the respective pages
                // remove <a>
                if(status === 'locked'){
                    itemHTML = '<li class="specific-item-details"><div class="specific-item-type-icon"><i class="icon-'+typeIcon+'"></i></div><div class="specific-item-name">'+pageTitle+'</div><div class="specific-item-status-icon"><i class="icon-'+statusIcon+' '+itemStatus+'"></i></div></li>';

                // if module NOT locked, item can be clicked to lead users to the respective item page
                // added <a href="link/to/item">
                }else{
                    itemHTML = '<li class="specific-item-details"><a href="'+itemLink+'"><div class="specific-item-type-icon'+itemTypeStatusClass+'"><i class="icon-'+typeIcon+'"></i></div><div class="specific-item-name">'+pageTitle+'</div><div class="specific-item-status-icon"><i class="icon-'+statusIcon+' '+itemStatus+'"></i></div></a></li>';
                }

                // insert item into the item container
                $('.module-'+(i+1)+'-box .item-container').append(itemHTML);

            }
        }

        // calculate progress of started module
        function calcStartedModuleProgress(moduleObj, moduleObjIndex){
            var itemObj = moduleObj[moduleObjIndex]['items'];
            var itemCompletedCount=0;
            var totalItem =itemObj.length;

            // calculate number of item completed
            for (var i=0;i<totalItem;i++){
                // check if item has 'completion_requirement' and 'completed' data
                //   only item with requirements has 'completion_requirement' data
                //   only user with student role includes 'completed' data
                if (itemObj[i]['completion_requirement']){
                    if (itemObj[i]['completion_requirement']['completed']){
                        itemCompletedCount +=1;
                    }
                }
            }

            // convert into percentage
            var moduleProgress = ((itemCompletedCount/totalItem)*100).toFixed(1);

            // insert module progress to progress bar and module detail
            $('.course-progress-module-'+(moduleObjIndex+1)+' .module-progress-status').css('width', moduleProgress+'%');
            $('.module-'+(moduleObjIndex+1)+'-box .module-progress-percentage').text(moduleProgress +'%');

            // record progress to module obj
            moduleObj[moduleObjIndex]['progress']=moduleProgress;

            // add prerequisite to module detail
            if(moduleObj[moduleObjIndex]['prerequisite_module_ids'].length >0){
                var preIdObj = moduleObj[moduleObjIndex]['prerequisite_module_ids'];
                addPrerequisite(moduleObj,moduleObjIndex,preIdObj);
            }

            // calculate total course progress if this is the last module
            if (moduleObjIndex === (moduleObj.length-1)){
                calcTotalCourseProgress(moduleObj);
            }
        }

        // add prerequisite module with progress to module details
        function addPrerequisite(moduleObj,moduleObjIndex,preIdObj){
            var state, preMessage;

            // check if state exist
            if (moduleObj[moduleObjIndex]['state']){
                state = moduleObj[moduleObjIndex]['state'];
            }

            // customise message depending on state of the selected module
            if(state === 'locked'){
                preMessage = 'Complete prerequisite(s) below to unlock this module.';
            }else {
                preMessage = 'Prerequisite(s) completed.';
            }

            // insert message into module detail
            $('.module-'+(moduleObjIndex+1)+'-box .specific-module-prerequisite').text(preMessage);

            // determine the prerequisite module name, progress and link
            for (var j=0;j<preIdObj.length;j++){
                var preID = preIdObj[j];

                for (var k=0;k<moduleObj.length;k++){
                    if (moduleObj[k]['id'] === preIdObj[j]){
                        var preProgress = moduleObj[k]['progress'];
                        var preName = moduleObj[k]['name'];
                        var preLink = moduleObj[k]['html_url'];
                        var preHTML, thisState;

                        if(moduleObj[k]['state']){
                            thisState = moduleObj[k]['state'];
                        }else {
                            thisState = 'teacher';
                        }

                        // If prerequisite module is locked, remove link <a>
                        if(thisState==='locked'){
                            preHTML = '<li class="locked">'+preName+' (Module locked)</li>';

                        // Add link to prerequisite module
                        }else if(thisState === 'teacher') {
                            preHTML = '<li><a href="'+preLink+'">'+preName+'</a></li>';

                        // Add link to prerequisite module
                        }else{
                            preHTML = '<li><a href="'+preLink+'">'+preName+' ('+preProgress+'% completed)</a></li>';
                        }

                        // Insert prerequisite module into module detail
                        $('.module-'+(moduleObjIndex+1)+'-box .module-prerequisite-list').append(preHTML);
                    }
                }
            }
        }

        // calculate the total course progress
        function calcTotalCourseProgress(moduleObj){
            var moduleBoxNumber = moduleObj.length;
            var moduleProgressSum=0;

            // calculate sum of all module progress
            for (var i=0;i<moduleBoxNumber;i++){
                var moduleProgress = parseFloat(moduleObj[i]['progress']);
                moduleProgressSum +=moduleProgress;
            }

            // convert to percentage
            var totalCourseProgress = (moduleProgressSum/moduleBoxNumber);

            // insert into progress bar
            $('#course-progress-percentage').text(totalCourseProgress.toFixed(1)+'%');

            //console.log(moduleObj)
        }

    } else
    // run this function if id exist
    if ($('#user-course-progress-bar').length){
        // get url path
        var urlPath = window.location.pathname.split('/');
        var courseID, moduleNo,moduleObj, isStudent;

        // get course id from url path
        for (var i=0;i<urlPath.length;i++){
            if(urlPath[i]==='courses'){
                courseID = urlPath[i+1];
                getModuleObj(courseID);
            }
        }

        // get the module object data with Canvas API
        function getModuleObj(courseID){
            // ensure that courseID exist before calling function
            if($.isNumeric(courseID)){
                $.ajax({
                    url: "https://rmit.instructure.com/api/v1/courses/"+courseID+"/modules?include=items&per_page=50"
                }).then(function(data) {
                    moduleObj = data;
                    moduleNo = moduleObj.length;

                    for (var i=0;i<moduleNo;i++){
                        var moduleState;
                        var moduleID = moduleObj[i]['id'];
                        var moduleName = moduleObj[i]['name'];
                        var itemURL = moduleObj[i]['items_url'];

                        // check for module state
                        //   user with teacher or designer role do not have state
                        if (moduleObj[i]['state']){
                            moduleState = moduleObj[i]['state'];
                        }else{
                            //console.log('teacher view');
                            moduleState = 'teacher';
                        }

                        // initiate building of progress bar and module detail shell
                        buildModuleShell((i+1),i, moduleState, moduleID, courseID, moduleName,moduleObj);
                    }

                    // function to handle the progress bar module button
                    // show and hide module detail on click
                    $('.course-progress-module-container').on('click',function(moduleObj){
                        $('.course-progress-module-container').removeClass('active');
                        $(this).addClass('active');
                        var no = $(this).attr('data-module-no');

                        $('.specific-module-box');
                        setTimeout(function(){
                            $('.specific-module-box').removeClass('active');
                            $('.module-'+no+'-box').addClass('active');
                        });
                    });
                });
            }
        }

        // build the shell for progress bar and module detail
        function buildModuleShell(moduleDisplayNumber,moduleObjIndex, state,moduleID, courseID, moduleName, moduleObj){
            var icon,moduleStateClass,moduleDetailStatus,moduleURL,moduleStatus='', btntitle='', widthCSS='';
            moduleURL = 'https://rmit.instructure.com/courses/'+courseID+'/modules#module_'+moduleID+'';

            // Module Unlocked
            // if user has teacher, designer role, module will be set as unlocked
            if (state === 'unlocked' || state === 'teacher'){
                icon = 'arrow-open-right'; // icon for the module state
                moduleStateClass = 'course-progress-module-open';
                moduleDetailStatus ='<h3 class="module-progress-percentage"></h3><p class="module-status">Not yet started</p>';
                widthCSS = 'width:0%;'; // width of the progress bar indicator
                moduleObj[moduleObjIndex]['progress']=0;
                btntitle='Explore module';

            // Module Started
            }else if (state === 'started'){
                icon = 'arrow-open-right';
                moduleStateClass = 'course-progress-module-open';
                moduleDetailStatus ='<h3 class="module-progress-percentage"></h3><p class="module-status">Completed</p>';
                moduleObj[moduleObjIndex]['progress']=0;
                btntitle='Explore module';

            // Module Completed
            }else if (state === 'completed'){
                icon = 'check';
                moduleStateClass = 'course-progress-module-complete';
                moduleDetailStatus ='<span class="module-progress-icon"><i class="icon-'+icon+'"></i></span><p class="module-status">Completed</p>';
                btntitle='Module complete';
                widthCSS = 'width:100%;'; // width of the progress bar indicator
                moduleObj[moduleObjIndex]['progress']=100;

            // Module Locked
            }else if (state === 'locked'){
                icon = 'lock';
                moduleStateClass = 'course-progress-module-locked';
                moduleDetailStatus ='<span class="module-progress-icon"><i class="icon-'+icon+'"></i></span><p class="module-status">Locked</p>';
                btntitle='Module locked';
                widthCSS = 'width:0%;'; // width of the progress bar indicator
                moduleStatus=' item-locked'; // class to reduce opacity of locked item
                moduleObj[moduleObjIndex]['progress']=0;
            }

           // progress bar shell
            $('.course-progress-container').append('<li><div class="card course-progress-module-container course-progress-module-'+moduleDisplayNumber+' '+moduleStateClass+'" data-module-no="'+moduleDisplayNumber+'"><div class="module-progress-status" style="'+widthCSS+'"></div><div class="course-progress-module-title-wrapper "><h4 class="card-title">'+moduleName+'</h4><a href="#module-container" class="btn">'+btntitle+' <i class="icon-'+icon+'"></i></a></div></div></li>');

            // module detail shell
            $('.module-item-container').append('<div class="specific-module-box module-'+moduleDisplayNumber+'-box"><div class="specific-module-details"><div class="module-container"><div class="module-details"><h3 class="specific-module-name">'+moduleName+'</h3><h4 class="specific-module-prerequisite"></h4><ul class="module-prerequisite-list"></ul></div><div class="module-status">'+moduleDetailStatus+'</div></div><ul class="item-container '+moduleStatus+'"></ul></div></div>');


            // add items into module detail
            addItemsIntoModuleBox(moduleObj, moduleObjIndex);

            // add prerequisite if the module progress have been determined
            if(moduleObj[moduleObjIndex]['prerequisite_module_ids'].length >0 && state !== 'started'){
                var preIdObj = moduleObj[moduleObjIndex]['prerequisite_module_ids'];
                addPrerequisite(moduleObj,moduleObjIndex,preIdObj);
            }

            // calculate the total course progress at the end of the iteration
            // but if the last module has a 'started' state, then calculate that module first
            if(moduleObjIndex === moduleObj.length-1 && state !== 'started'){
                calcTotalCourseProgress(moduleObj);

            // calculate the progress of the started module
            }else if (state === 'started'){
                calcStartedModuleProgress(moduleObj, moduleObjIndex);
            }


        }

        // add items into module detail
        function addItemsIntoModuleBox(moduleObj, i){
            var itemObj = moduleObj[i]['items'];
            var status = moduleObj[i]['state'];
            for(var k=0;k<itemObj.length;k++){
                var typeIcon, statusIcon,itemStatus,itemTypeStatusClass;

                // get the item type to determine the icon to insert
                if(itemObj[k]['type'] === 'Page'){
                    typeIcon = 'document';
                }else if(itemObj[k]['type'] === 'Assignment'){
                    typeIcon = 'assignment';
                }else if(itemObj[k]['type'] === 'Quiz'){
                    typeIcon = 'quiz';
                }else if(itemObj[k]['type'] === 'Discussion'){
                    typeIcon = 'discussion';
                }else if(itemObj[k]['type'] === 'ExternalUrl' || itemObj[k]['type'] ==='ExternalTool'){
                    typeIcon = 'link';
                }else if(itemObj[k]['type'] === 'File'){
                    typeIcon = 'download';
                }

                // check if item has 'completion_requirement' and 'completed' data
                //   only item with requirements has 'completion_requirement' data
                //   only user with student role includes 'completed' data
                if (itemObj[k]['completion_requirement']){
                    if(itemObj[k]['completion_requirement']['completed']){
                        statusIcon='check';
                        itemStatus = 'completed';
                        itemTypeStatusClass = ' item-completed';
                    }else{
                        statusIcon='empty';
                        itemStatus = '';
                        itemTypeStatusClass='';
                    }
                }else{
                    statusIcon='empty';
                    itemStatus = '';
                    itemTypeStatusClass='';
                }

                var itemLink = itemObj[k]['html_url'];
                var pageTitle = itemObj[k]['title'];
                var itemHTML;

                // if module is locked, item cannot be linked to the respective pages
                // remove <a>
                if(status === 'locked'){
                    itemHTML = '<li class="specific-item-details"><div class="specific-item-type-icon"><i class="icon-'+typeIcon+'"></i></div><div class="specific-item-name">'+pageTitle+'</div><div class="specific-item-status-icon"><i class="icon-'+statusIcon+' '+itemStatus+'"></i></div></li>';

                // if module NOT locked, item can be clicked to lead users to the respective item page
                // added <a href="link/to/item">
                }else{
                    itemHTML = '<li class="specific-item-details"><div class="specific-item-type-icon'+itemTypeStatusClass+'"><i class="icon-'+typeIcon+'"></i></div><div class="specific-item-name"><a href="'+itemLink+'">'+pageTitle+'</a></div><div class="specific-item-status-icon"><i class="icon-'+statusIcon+' '+itemStatus+'"></i></div></li>';
                }

                // insert item into the item container
                $('.module-'+(i)+'-box .item-container').append(itemHTML);

            }
        }

        // calculate progress of started module
        function calcStartedModuleProgress(moduleObj, moduleObjIndex){
            var itemObj = moduleObj[moduleObjIndex]['items'];
            var itemCompletedCount=0;
            var totalItem =itemObj.length;

            // calculate number of item completed
            for (var i=0;i<totalItem;i++){
                // check if item has 'completion_requirement' and 'completed' data
                //   only item with requirements has 'completion_requirement' data
                //   only user with student role includes 'completed' data
                if (itemObj[i]['completion_requirement']){
                    if (itemObj[i]['completion_requirement']['completed']){
                        itemCompletedCount +=1;
                    }
                }
            }

            // convert into percentage
            var moduleProgress = ((itemCompletedCount/totalItem)*100).toFixed(1);

            // insert module progress to progress bar and module detail
            $('.course-progress-module-'+(moduleObjIndex)+' .module-progress-status').css('width', moduleProgress+'%');
            $('.module-'+(moduleObjIndex)+'-box .module-progress-percentage').text(moduleProgress +'%');

            // record progress to module obj
            moduleObj[moduleObjIndex]['progress']=moduleProgress;

            // add prerequisite to module detail
            if(moduleObj[moduleObjIndex]['prerequisite_module_ids'].length >0){
                var preIdObj = moduleObj[moduleObjIndex]['prerequisite_module_ids'];
                addPrerequisite(moduleObj,moduleObjIndex,preIdObj);
            }

            // calculate total course progress if this is the last module
            if (moduleObjIndex === (moduleObj.length-1)){
                calcTotalCourseProgress(moduleObj);
            }
        }

        // add prerequisite module with progress to module details
        function addPrerequisite(moduleObj,moduleObjIndex,preIdObj){
            var state, preMessage;

            // check if state exist
            if (moduleObj[moduleObjIndex]['state']){
                state = moduleObj[moduleObjIndex]['state'];
            }

            // customise message depending on state of the selected module
            if(state === 'locked'){
                preMessage = 'Complete prerequisite(s) below to unlock this module.';
            }else {
                preMessage = 'Prerequisite(s) completed.';
            }

            // insert message into module detail
            $('.module-'+(moduleObjIndex)+'-box .specific-module-prerequisite').text(preMessage);

            // determine the prerequisite module name, progress and link
            for (var j=0;j<preIdObj.length;j++){
                var preID = preIdObj[j];

                for (var k=0;k<moduleObj.length;k++){
                    if (moduleObj[k]['id'] === preIdObj[j]){
                        var preProgress = moduleObj[k]['progress'];
                        var preName = moduleObj[k]['name'];
                        var preLink = moduleObj[k]['html_url'];
                        var preHTML, thisState;

                        if(moduleObj[k]['state']){
                            thisState = moduleObj[k]['state'];
                        }else {
                            thisState = 'teacher';
                        }

                        // If prerequisite module is locked, remove link <a>
                        if(thisState==='locked'){
                            preHTML = '<li class="locked">'+preName+' (Module locked)</li>';

                        // Add link to prerequisite module
                        }else if(thisState === 'teacher') {
                            preHTML = '<li><a href="'+preLink+'">'+preName+'</a></li>';

                        // Add link to prerequisite module
                        }else{
                            preHTML = '<li><a href="'+preLink+'">'+preName+' ('+preProgress+'% completed)</a></li>';
                        }

                        // Insert prerequisite module into module detail
                        $('.module-'+(moduleObjIndex)+'-box .module-prerequisite-list').append(preHTML);
                    }
                }
            }
        }

        // calculate the total course progress
        function calcTotalCourseProgress(moduleObj){
            var moduleBoxNumber = moduleObj.length;
            var moduleProgressSum=0;

            // calculate sum of all module progress
            for (var i=0;i<moduleBoxNumber;i++){
                var moduleProgress = parseFloat(moduleObj[i]['progress']);
                moduleProgressSum +=moduleProgress;
            }

            // convert to percentage
            var totalCourseProgress = (moduleProgressSum/moduleBoxNumber);

            // insert into progress bar
            $('#course-progress-percentage').text(totalCourseProgress.toFixed(1)+'%');

            //console.log(moduleObj)
        }
    }
});
/*! iFrame Resizer (iframeSizer.min.js ) - v3.5.15 - 2017-10-15
 *  Desc: Force cross domain iframes to size to content.
 *  Requires: iframeResizer.contentWindow.min.js to be loaded into the target frame.
 *  Copyright: (c) 2017 David J. Bradshaw - dave@bradshaw.net
 *  License: MIT
 */

!function(a){"use strict";function b(a,b,c){"addEventListener"in window?a.addEventListener(b,c,!1):"attachEvent"in window&&a.attachEvent("on"+b,c)}function c(a,b,c){"removeEventListener"in window?a.removeEventListener(b,c,!1):"detachEvent"in window&&a.detachEvent("on"+b,c)}function d(){var a,b=["moz","webkit","o","ms"];for(a=0;a<b.length&&!N;a+=1)N=window[b[a]+"RequestAnimationFrame"];N||h("setup","RequestAnimationFrame not supported")}function e(a){var b="Host page: "+a;return window.top!==window.self&&(b=window.parentIFrame&&window.parentIFrame.getId?window.parentIFrame.getId()+": "+a:"Nested host page: "+a),b}function f(a){return K+"["+e(a)+"]"}function g(a){return P[a]?P[a].log:G}function h(a,b){k("log",a,b,g(a))}function i(a,b){k("info",a,b,g(a))}function j(a,b){k("warn",a,b,!0)}function k(a,b,c,d){!0===d&&"object"==typeof window.console&&console[a](f(b),c)}function l(a){function d(){function a(){s(U),p(V),I("resizedCallback",U)}f("Height"),f("Width"),t(a,U,"init")}function e(){var a=T.substr(L).split(":");return{iframe:P[a[0]]&&P[a[0]].iframe,id:a[0],height:a[1],width:a[2],type:a[3]}}function f(a){var b=Number(P[V]["max"+a]),c=Number(P[V]["min"+a]),d=a.toLowerCase(),e=Number(U[d]);h(V,"Checking "+d+" is in range "+c+"-"+b),c>e&&(e=c,h(V,"Set "+d+" to min value")),e>b&&(e=b,h(V,"Set "+d+" to max value")),U[d]=""+e}function g(){function b(){function a(){var a=0,b=!1;for(h(V,"Checking connection is from allowed list of origins: "+d);a<d.length;a++)if(d[a]===c){b=!0;break}return b}function b(){var a=P[V]&&P[V].remoteHost;return h(V,"Checking connection is from: "+a),c===a}return d.constructor===Array?a():b()}var c=a.origin,d=P[V]&&P[V].checkOrigin;if(d&&""+c!="null"&&!b())throw new Error("Unexpected message received from: "+c+" for "+U.iframe.id+". Message was: "+a.data+". This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.");return!0}function k(){return K===(""+T).substr(0,L)&&T.substr(L).split(":")[0]in P}function l(){var a=U.type in{"true":1,"false":1,undefined:1};return a&&h(V,"Ignoring init message from meta parent page"),a}function w(a){return T.substr(T.indexOf(":")+J+a)}function y(a){h(V,"MessageCallback passed: {iframe: "+U.iframe.id+", message: "+a+"}"),I("messageCallback",{iframe:U.iframe,message:JSON.parse(a)}),h(V,"--")}function z(){var a=document.body.getBoundingClientRect(),b=U.iframe.getBoundingClientRect();return JSON.stringify({iframeHeight:b.height,iframeWidth:b.width,clientHeight:Math.max(document.documentElement.clientHeight,window.innerHeight||0),clientWidth:Math.max(document.documentElement.clientWidth,window.innerWidth||0),offsetTop:parseInt(b.top-a.top,10),offsetLeft:parseInt(b.left-a.left,10),scrollTop:window.pageYOffset,scrollLeft:window.pageXOffset})}function A(a,b){function c(){u("Send Page Info","pageInfo:"+z(),a,b)}x(c,32)}function B(){function a(a,b){function c(){P[f]?A(P[f].iframe,f):d()}["scroll","resize"].forEach(function(d){h(f,a+d+" listener for sendPageInfo"),b(window,d,c)})}function d(){a("Remove ",c)}function e(){a("Add ",b)}var f=V;e(),P[f]&&(P[f].stopPageInfo=d)}function C(){P[V]&&P[V].stopPageInfo&&(P[V].stopPageInfo(),delete P[V].stopPageInfo)}function D(){var a=!0;return null===U.iframe&&(j(V,"IFrame ("+U.id+") not found"),a=!1),a}function E(a){var b=a.getBoundingClientRect();return o(V),{x:Math.floor(Number(b.left)+Number(M.x)),y:Math.floor(Number(b.top)+Number(M.y))}}function F(a){function b(){M=f,G(),h(V,"--")}function c(){return{x:Number(U.width)+e.x,y:Number(U.height)+e.y}}function d(){window.parentIFrame?window.parentIFrame["scrollTo"+(a?"Offset":"")](f.x,f.y):j(V,"Unable to scroll to requested position, window.parentIFrame not found")}var e=a?E(U.iframe):{x:0,y:0},f=c();h(V,"Reposition requested from iFrame (offset x:"+e.x+" y:"+e.y+")"),window.top!==window.self?d():b()}function G(){!1!==I("scrollCallback",M)?p(V):q()}function H(a){function b(){var a=E(f);h(V,"Moving to in page link (#"+d+") at x: "+a.x+" y: "+a.y),M={x:a.x,y:a.y},G(),h(V,"--")}function c(){window.parentIFrame?window.parentIFrame.moveToAnchor(d):h(V,"In page link #"+d+" not found and window.parentIFrame not found")}var d=a.split("#")[1]||"",e=decodeURIComponent(d),f=document.getElementById(e)||document.getElementsByName(e)[0];f?b():window.top!==window.self?c():h(V,"In page link #"+d+" not found")}function I(a,b){return m(V,a,b)}function N(){switch(P[V]&&P[V].firstRun&&S(),U.type){case"close":P[V].closeRequestCallback?m(V,"closeRequestCallback",P[V].iframe):n(U.iframe);break;case"message":y(w(6));break;case"scrollTo":F(!1);break;case"scrollToOffset":F(!0);break;case"pageInfo":A(P[V]&&P[V].iframe,V),B();break;case"pageInfoStop":C();break;case"inPageLink":H(w(9));break;case"reset":r(U);break;case"init":d(),I("initCallback",U.iframe);break;default:d()}}function O(a){var b=!0;return P[a]||(b=!1,j(U.type+" No settings for "+a+". Message was: "+T)),b}function Q(){for(var a in P)u("iFrame requested init",v(a),document.getElementById(a),a)}function S(){P[V]&&(P[V].firstRun=!1)}var T=a.data,U={},V=null;"[iFrameResizerChild]Ready"===T?Q():k()?(U=e(),V=R=U.id,P[V]&&(P[V].loaded=!0),!l()&&O(V)&&(h(V,"Received: "+T),D()&&g()&&N())):i(V,"Ignored: "+T)}function m(a,b,c){var d=null,e=null;if(P[a]){if(d=P[a][b],"function"!=typeof d)throw new TypeError(b+" on iFrame["+a+"] is not a function");e=d(c)}return e}function n(a){var b=a.id;h(b,"Removing iFrame: "+b),a.parentNode&&a.parentNode.removeChild(a),m(b,"closedCallback",b),h(b,"--"),delete P[b]}function o(b){null===M&&(M={x:window.pageXOffset!==a?window.pageXOffset:document.documentElement.scrollLeft,y:window.pageYOffset!==a?window.pageYOffset:document.documentElement.scrollTop},h(b,"Get page position: "+M.x+","+M.y))}function p(a){null!==M&&(window.scrollTo(M.x,M.y),h(a,"Set page position: "+M.x+","+M.y),q())}function q(){M=null}function r(a){function b(){s(a),u("reset","reset",a.iframe,a.id)}h(a.id,"Size reset requested by "+("init"===a.type?"host page":"iFrame")),o(a.id),t(b,a,"reset")}function s(a){function b(b){a.iframe.style[b]=a[b]+"px",h(a.id,"IFrame ("+e+") "+b+" set to "+a[b]+"px")}function c(b){H||"0"!==a[b]||(H=!0,h(e,"Hidden iFrame detected, creating visibility listener"),y())}function d(a){b(a),c(a)}var e=a.iframe.id;P[e]&&(P[e].sizeHeight&&d("height"),P[e].sizeWidth&&d("width"))}function t(a,b,c){c!==b.type&&N?(h(b.id,"Requesting animation frame"),N(a)):a()}function u(a,b,c,d,e){function f(){var e=P[d]&&P[d].targetOrigin;h(d,"["+a+"] Sending msg to iframe["+d+"] ("+b+") targetOrigin: "+e),c.contentWindow.postMessage(K+b,e)}function g(){j(d,"["+a+"] IFrame("+d+") not found")}function i(){c&&"contentWindow"in c&&null!==c.contentWindow?f():g()}function k(){function a(){!P[d]||P[d].loaded||l||(l=!0,j(d,"IFrame has not responded within "+P[d].warningTimeout/1e3+" seconds. Check iFrameResizer.contentWindow.js has been loaded in iFrame. This message can be ingored if everything is working, or you can set the warningTimeout option to a higher value or zero to suppress this warning."))}e&&P[d]&&P[d].warningTimeout&&(P[d].msgTimeout=setTimeout(a,P[d].warningTimeout))}var l=!1;d=d||c.id,P[d]&&(i(),k())}function v(a){return a+":"+P[a].bodyMarginV1+":"+P[a].sizeWidth+":"+P[a].log+":"+P[a].interval+":"+P[a].enablePublicMethods+":"+P[a].autoResize+":"+P[a].bodyMargin+":"+P[a].heightCalculationMethod+":"+P[a].bodyBackground+":"+P[a].bodyPadding+":"+P[a].tolerance+":"+P[a].inPageLinks+":"+P[a].resizeFrom+":"+P[a].widthCalculationMethod}function w(c,d){function e(){function a(a){1/0!==P[x][a]&&0!==P[x][a]&&(c.style[a]=P[x][a]+"px",h(x,"Set "+a+" = "+P[x][a]+"px"))}function b(a){if(P[x]["min"+a]>P[x]["max"+a])throw new Error("Value for min"+a+" can not be greater than max"+a)}b("Height"),b("Width"),a("maxHeight"),a("minHeight"),a("maxWidth"),a("minWidth")}function f(){var a=d&&d.id||S.id+F++;return null!==document.getElementById(a)&&(a+=F++),a}function g(a){return R=a,""===a&&(c.id=a=f(),G=(d||{}).log,R=a,h(a,"Added missing iframe ID: "+a+" ("+c.src+")")),a}function i(){switch(h(x,"IFrame scrolling "+(P[x]&&P[x].scrolling?"enabled":"disabled")+" for "+x),c.style.overflow=!1===(P[x]&&P[x].scrolling)?"hidden":"auto",P[x]&&P[x].scrolling){case!0:c.scrolling="yes";break;case!1:c.scrolling="no";break;default:c.scrolling=P[x]?P[x].scrolling:"no"}}function k(){("number"==typeof(P[x]&&P[x].bodyMargin)||"0"===(P[x]&&P[x].bodyMargin))&&(P[x].bodyMarginV1=P[x].bodyMargin,P[x].bodyMargin=""+P[x].bodyMargin+"px")}function l(){var a=P[x]&&P[x].firstRun,b=P[x]&&P[x].heightCalculationMethod in O;!a&&b&&r({iframe:c,height:0,width:0,type:"init"})}function m(){Function.prototype.bind&&P[x]&&(P[x].iframe.iFrameResizer={close:n.bind(null,P[x].iframe),resize:u.bind(null,"Window resize","resize",P[x].iframe),moveToAnchor:function(a){u("Move to anchor","moveToAnchor:"+a,P[x].iframe,x)},sendMessage:function(a){a=JSON.stringify(a),u("Send Message","message:"+a,P[x].iframe,x)}})}function o(d){function e(){u("iFrame.onload",d,c,a,!0),l()}b(c,"load",e),u("init",d,c,a,!0)}function p(a){if("object"!=typeof a)throw new TypeError("Options is not an object")}function q(a){for(var b in S)S.hasOwnProperty(b)&&(P[x][b]=a.hasOwnProperty(b)?a[b]:S[b])}function s(a){return""===a||"file://"===a?"*":a}function t(a){a=a||{},P[x]={firstRun:!0,iframe:c,remoteHost:c.src.split("/").slice(0,3).join("/")},p(a),q(a),P[x]&&(P[x].targetOrigin=!0===P[x].checkOrigin?s(P[x].remoteHost):"*")}function w(){return x in P&&"iFrameResizer"in c}var x=g(c.id);w()?j(x,"Ignored iFrame, already setup."):(t(d),i(),e(),k(),o(v(x)),m())}function x(a,b){null===Q&&(Q=setTimeout(function(){Q=null,a()},b))}function y(){function a(){function a(a){function b(b){return"0px"===(P[a]&&P[a].iframe.style[b])}function c(a){return null!==a.offsetParent}P[a]&&c(P[a].iframe)&&(b("height")||b("width"))&&u("Visibility change","resize",P[a].iframe,a)}for(var b in P)a(b)}function b(b){h("window","Mutation observed: "+b[0].target+" "+b[0].type),x(a,16)}function c(){var a=document.querySelector("body"),c={attributes:!0,attributeOldValue:!1,characterData:!0,characterDataOldValue:!1,childList:!0,subtree:!0},e=new d(b);e.observe(a,c)}var d=window.MutationObserver||window.WebKitMutationObserver;d&&c()}function z(a){function b(){B("Window "+a,"resize")}h("window","Trigger event: "+a),x(b,16)}function A(){function a(){B("Tab Visable","resize")}"hidden"!==document.visibilityState&&(h("document","Trigger event: Visiblity change"),x(a,16))}function B(a,b){function c(a){return P[a]&&"parent"===P[a].resizeFrom&&P[a].autoResize&&!P[a].firstRun}for(var d in P)c(d)&&u(a,b,document.getElementById(d),d)}function C(){b(window,"message",l),b(window,"resize",function(){z("resize")}),b(document,"visibilitychange",A),b(document,"-webkit-visibilitychange",A),b(window,"focusin",function(){z("focus")}),b(window,"focus",function(){z("focus")})}function D(){function b(a,b){function c(){if(!b.tagName)throw new TypeError("Object is not a valid DOM element");if("IFRAME"!==b.tagName.toUpperCase())throw new TypeError("Expected <IFRAME> tag, found <"+b.tagName+">")}b&&(c(),w(b,a),e.push(b))}function c(a){a&&a.enablePublicMethods&&j("enablePublicMethods option has been removed, public methods are now always available in the iFrame")}var e;return d(),C(),function(d,f){switch(e=[],c(d),typeof f){case"undefined":case"string":Array.prototype.forEach.call(document.querySelectorAll(f||"iframe"),b.bind(a,d));break;case"object":b(d,f);break;default:throw new TypeError("Unexpected data type ("+typeof f+")")}return e}}function E(a){a.fn?a.fn.iFrameResize||(a.fn.iFrameResize=function(a){function b(b,c){w(c,a)}return this.filter("iframe").each(b).end()}):i("","Unable to bind to jQuery, it is not fully loaded.")}if("undefined"!=typeof window){var F=0,G=!1,H=!1,I="message",J=I.length,K="[iFrameSizer]",L=K.length,M=null,N=window.requestAnimationFrame,O={max:1,scroll:1,bodyScroll:1,documentElementScroll:1},P={},Q=null,R="Host Page",S={autoResize:!0,bodyBackground:null,bodyMargin:null,bodyMarginV1:8,bodyPadding:null,checkOrigin:!0,inPageLinks:!1,enablePublicMethods:!0,heightCalculationMethod:"bodyOffset",id:"iFrameResizer",interval:32,log:!1,maxHeight:1/0,maxWidth:1/0,minHeight:0,minWidth:0,resizeFrom:"parent",scrolling:!1,sizeHeight:!0,sizeWidth:!1,warningTimeout:5e3,tolerance:0,widthCalculationMethod:"scroll",closedCallback:function(){},initCallback:function(){},messageCallback:function(){j("MessageCallback function not defined")},resizedCallback:function(){},scrollCallback:function(){return!0}};window.jQuery&&E(window.jQuery),"function"==typeof define&&define.amd?define([],D):"object"==typeof module&&"object"==typeof module.exports?module.exports=D():window.iFrameResize=window.iFrameResize||D()}}();
//# sourceMappingURL=iframeResizer.map
iFrameResize({log:true}, '#C3319iframe','#C3319iframe1','#C3319iframe2','#C3319iframe3','#C3319iframe4','#C3319iframe5','#C3319iframe6','#C3319iframe7','#C3319iframe8', '#C3319iframe9','#C3319iframe10','#C3319iframe11','#C3319iframe12','#C3319iframe13','#C3319iframe14','#C3319iframe15','#ReIframe','#ReIframe2','#ReIframe3');
$(document).ready(function() {
    if ($('#assessment-list').length){
        // get url path
        var urlPath = window.location.pathname.split('/');
        var courseID, moduleNo,moduleObj, isStudent;

        // get course id from url path
        for (var i=0;i<urlPath.length;i++){
            if(urlPath[i]==='courses'){
                courseID = urlPath[i+1];
                getModuleObj(courseID);
            }
        }

        // get the module object data with Canvas API
        function getModuleObj(courseID){
            // ensure that courseID exist before calling function
            if($.isNumeric(courseID)){
                $.ajax({
                    url: "https://rmit.instructure.com/api/v1/courses/"+courseID+"/assignments?include=items&per_page=100"
                }).then(function(data) {
                    moduleObj = data;
                    moduleNo = moduleObj.length;

                    for (var i=0;i<moduleNo;i++){
                        var assignmentState= moduleObj[i]['submission_types'];
                        var assignmentID = moduleObj[i]['id'];
                        var assignmentName = moduleObj[i]['name'];
                        var itemURL = moduleObj[i]['html_url'];
                        var duedate = new Date(moduleObj[i]['due_at']);

                        // initiate building assessment list
                        buildassessmentlist((i+1),i, assignmentState, assignmentID, courseID, assignmentName,moduleObj,itemURL,duedate);
                        // initiate building quiz list
                        buildquizlist((i+1),i, assignmentState, assignmentID, courseID, assignmentName,moduleObj,itemURL,duedate);
                        // initiate building quiz list
                        buildallassessment((i+1),i, assignmentState, assignmentID, courseID, assignmentName,moduleObj,itemURL,duedate);
                    }

                    });
            }
        }

        // build assessment list
        function buildassessmentlist (moduleDisplayNumber,moduleObjIndex,assignmentState,assignmentID, courseID, assignmentName, moduleObj, itemURL, duedate){

            // module detail shell
            $(".assignment-item-list").append('<tr class="assessment-type"><td><a target="_blank" href="'+itemURL+'">'+assignmentName+'</a><span style="visibility:hidden;">'+assignmentState+'</span></td><td ><div class="due-date">'+duedate+'</div></td></tr>');

            // hide date if there in no value
            $('.assessment-type:contains("online_quiz")').hide();
            $('.assessment-type:contains("WIL")').hide();
            $('.assessment-type:contains("Workplace documentation")').show();
        }
         // build the quiz list
                function buildquizlist (moduleDisplayNumber, moduleObjIndex, assignmentState, assignmentID, courseID, assignmentName, moduleObj, itemURL, duedate){

            // Quiz list
            $(".quiz-item-list").append('<tr class="quiz-type"><td><a target="_blank" href="'+itemURL+'">'+assignmentName+'</a><span style="visibility:hidden;">'+assignmentState+'</span></td><td ><div class="due-date">'+duedate+'</div></td></tr>');

            // hide date if there in no value
            $('.quiz-type:contains("none")').hide();
            $('.quiz-type:contains("online_upload")').hide();
            $('.quiz-type:contains("diary")').hide();
            $('.due-date:contains("Thu Jan 01 1970")').hide();
        }


        // build the quiz list
                function buildallassessment (moduleDisplayNumber, moduleObjIndex, assignmentState, assignmentID, courseID, assignmentName, moduleObj, itemURL, duedate){

            // Quiz list
            $(".all-assessment-list").append('<tr class="all-assessment-type"><td><a target="_blank" href="'+itemURL+'">'+assignmentName+'</a><span style="visibility:hidden;">'+assignmentState+'</span></td><td ><div class="due-date">'+duedate+'</div></td></tr>');

            // hide date if there in no value
            $('.due-date:contains("Thu Jan 01 1970")').hide();
        }
    }




});

/*
**  Enable Custom Style in Rich Content Editor
**
**  Purpose/Description:
**      Automatically adds the custom CSS (21CC, RMITOnline, RMITStudios, RMIT Root) to the
**      Canvas rich content editor iframe when editing the page to allow styling of
**      custom components
**
**  License: (MIT License? Apache License 2.0? GNU Affero General Public License v3.0?)
**      TBC (Refer to the license.md)
**
**  Author(s):
**      Edwin Ang Ding Hou, 21CC Project, RMIT Univeristy
**
**  Contributor(s):
**
**
*/

/*
**  Enable Custom Style in Rich Content Editor
**
**  Purpose/Description:
**      Automatically adds the custom CSS (21CC, RMITOnline, RMITStudios, RMIT Root) to the
**      Canvas rich content editor iframe when editing the page to allow styling of
**      custom components
**
**  License: (MIT License? Apache License 2.0? GNU Affero General Public License v3.0?)
**      TBC (Refer to the license.md)
**
**  Author(s):
**      Edwin Ang Ding Hou, 21CC Project, RMIT Univeristy
**
**  Contributor(s):
**
**
*/

$(document).ready(function() {

    var counter=0;
    // run intervals to check if the iframe exits
    var checkEditorIframe = setInterval( function() {
        var pageIframe = $('#wiki_page_body_ifr');
        var syllabusIframe = $('#course_syllabus_body_ifr');
        var quizIframe = $('#quiz_description_ifr');
        var discussionIframe;
        for (var i=0;i<100;i++){
            if ($('#discussion-topic-message'+i+'_ifr').length){
                discussionIframe = $('#discussion-topic-message'+i+'_ifr');
                break;
            }else{
                discussionIframe = $('#discussion-topic-message9_ifr');
            }
        }


        var assignmentIframe = $('#assignment_description_ifr');

        // if iframe exist, clear the interval and run the function to get the CSS link
        if(pageIframe.length || syllabusIframe.length || quizIframe.length || discussionIframe.length || assignmentIframe.length){
            clearInterval(checkEditorIframe);
            if(pageIframe.length){
                getCSSLink(pageIframe);
            }else if (syllabusIframe.length){
                getCSSLink(syllabusIframe);
            }else if (quizIframe.length){
                getCSSLink(quizIframe);
            }else if (discussionIframe.length){
                getCSSLink(discussionIframe);
            }else if (assignmentIframe.length){
                getCSSLink(assignmentIframe);
            }
        }else if(counter === 20){
            clearInterval(checkEditorIframe);
        }else{
            counter +=1;
        }
    }, 500);

    // search through the document and obtain the css link via the file name
    function getCSSLink(currentIframe){
        // search through all links in head
        $('html head link').each(function(){
            // only get link with rel="stylesheet"
            if($(this).attr('rel') === 'stylesheet'){
                // get the href of the <link> and check for the name
                var link = $(this).attr('href');
                var checkName = link.split('/');

                // if the file name is correct, run insert link function and stop the loop
                if(checkName[checkName.length -1] === 'final.css' || checkName[checkName.length -1] === 'final.min.css')

                {
                    console.log(link);
                    insertCSS(link, currentIframe);
                    return false;
                }
            }
        });
    }


    // when the iframe loads, insert the <link> with the href for the custom css
    function insertCSS(href, currentIframe){
//        currentIframe.load(function(){
            currentIframe
                .contents().find("head")
                .append($('<link rel="stylesheet" type="text/css" href="'+href+'">')
            );
//        });
    }
});

//Remove canvas inline styles.
$("img.img-fluid").removeAttr("style")
//make iframes fit to Content
function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
  }
