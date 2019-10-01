/*
Global Emble Method

Purpose/Description: 
Allow addition of custom methods to enhance Emble

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
var emble = {
    rce: {
        contextMenuManager: {
            rect: {
                //                width: 42, 
                //                height: 37,
                pointer: 18,
            },
            menuItem: []
        },
        undoManager: {},
        customiseManager: {
            customiseItem: [],
            customiseItemPageID: 'customise-options',
        },
        deleteManager: {}
    },
    ui: {
        setting: {
            namespace: 'emble',
            quick_add: {
                enabled: true,
                block_category: [
                    // populated by script
                    //                    {
                    //                        name: 'category name',
                    //                        block: [
                    //                            'block page id',
                    //                            'block page id',
                    //                        ]
                    //                    },
                ]
            },
            default_view_emble: true,
        },
    },
    database: {
        course_id: 62705,
        filtered_block_category: [
            // populated by script
            //            {
            //                name: 'category name',
            //                id: 'module id',
            //                block: [
            //                    {
            //                        html: 'block html',
            //                        id: 'page id',
            //                        instruction: 'instruction html',
            //                        module_id: 'module id',
            //                        name: 'page name'
            //                    }
            //                ]
            //            }
        ],
        block_category: [
            // populated by script
            //            {
            //                name: 'category name',
            //                id: 'module id',
            //                block: [
            //                    {
            //                        html: 'block html',
            //                        id: 'page id',
            //                        instruction: 'instruction html',
            //                        module_id: 'module id',
            //                        name: 'page name'
            //                    }
            //                ]
            //            }
        ],
        help_pages: [
            'help-emble',
            'help-quick-add',
            'help-default-view'
        ],
        help_instruction: [
            // populated by script
            //            {
            //                html: "<p></p>",
            //                page_id: "help-quick-add"
            //            }
        ]
    },
    canvas_api: {}
};
/*
Delete Personal Emble Setting

Purpose/Description: 
Make a Canvas API call to delete the user's personal Emble settings.

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
emble.canvas_api.deleteEmbleSetting = function() {
    var namespace = emble.ui.setting.namespace;
    var parms = {
        'ns': namespace
    };
    return new Promise(function(resolve, reject) {
        $.ajax({
                url: '/api/v1/users/self/custom_data/' + namespace,
                type: 'DELETE',
                data: parms
            })
            .fail(function(error) {
                //            //console.log(error);
                reject(error);
            })
            .done(function(data) {
                var custom_data = JSON.parse(data.data);
                //            //console.log(custom_data);
                resolve(custom_data)
            });
    });
};
/*
Get Personal Emble Setting

Purpose/Description: 
Make a Canvas API call to get the user's personal Emble settings.

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
emble.canvas_api.getEmbleSetting = function() {
    var namespace = emble.ui.setting.namespace;
    var parms = {
        'ns': namespace
    };
    return new Promise(function(resolve, reject) {
        $.ajax({
                url: '/api/v1/users/self/custom_data/' + namespace,
                type: 'GET',
                data: parms
            })
            .fail(function(error) {
                //            //console.log(error);
                reject(error);
            })
            .done(function(data) {
                var custom_data = JSON.parse(data.data);
                //            //console.log(custom_data);
                resolve(custom_data)
            });
    });
};
/*
Get Canvas Item Data

Purpose/Description: 
Make a Canvas API call to get the data of an item (title, body, etc)

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
// get the data for an item (block html and instruction)
emble.canvas_api.getItemData = function(item_api_url) {
    return new Promise(function(resolve, reject) {
        $.ajax({
                url: item_api_url,
            })
            .fail(function(error) {
                //console.log(error);
                reject(error);
            })
            .done(function(item_data) {
                //            //console.log(item_data);
                resolve(item_data)
            });
    });
};
/*
Get Modules From a Canvas Course

Purpose/Description: 
Make a Canvas API call to get the modules and it's respectives module items from a course.

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
// get all modules from a course (block category)
emble.canvas_api.getModules = function(course_id) {
    return new Promise(function(resolve, reject) {
        $.ajax({
                url: '/api/v1/courses/' + course_id + '/modules?include[]=items&per_page=100',
            })
            .fail(function(error) {
                //console.log(error);
                reject(error);
            })
            .done(function(module_data) {
                //            //console.log(module_data);
                resolve(module_data)
            });
    });
};
/*
Set Personal Emble Setting

Purpose/Description: 
Make a Canvas API call to set the user's personal Emble settings.

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
emble.canvas_api.putEmbleSetting = function(CBsetting) {
    var embedded_data = JSON.stringify(CBsetting);
    var namespace = emble.ui.setting.namespace;
    var parms = {
        'ns': namespace,
        'data': embedded_data
    };
    return new Promise(function(resolve, reject) {
        $.ajax({
            'url': '/api/v1/users/self/custom_data/' + namespace,
            'type': 'PUT',
            'data': parms
        }).done(function(data) {
            //            //console.log('Updated Emble setting');
            //            //console.log(JSON.parse(data.data));
            resolve(data);
        }).fail(function(error) {
            //            //console.log('API fail');
            reject(error);
        });
    });
};
/*
Get Blocks Data

Purpose/Description: 
Get database for all blocks (components and templates) from the database course and map the data according to the category (modules)

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

// get all block data and map data to global CB
emble.database.getBlocks = function(database_course_id) {

    return new Promise(function(resolve, reject) {
        // use to track when all api calls are completed
        var no_item = 0,
            no_completed = 0;

        // get all block category
        emble.canvas_api.getModules(database_course_id).then(function(module_data) {
            for (var i = 0; i < module_data.length; i++) {

                // create obj for each category
                var category_data = {
                    name: module_data[i].name,
                    id: module_data[i].id,
                    block: [],
                }

                no_item += module_data[i].items.length;

                var item_obj = module_data[i].items;
                for (var k = 0; k < item_obj.length; k++) {


                    // create obj for each block
                    var block_data = {
                        name: item_obj[k].title,
                        html: '',
                        example_link: '',
                        module_id: module_data[i].id,
                        id: item_obj[k].page_url,
                        instruction: '',
                    }

                    // push block to category
                    if (!block_data.name.match(/instruction/gi)) {
                        category_data.block.push(block_data);
                    }

                    // push category to global CB when
                    if (k == item_obj.length - 1) {
                        emble.database.block_category.push(category_data);
                    }

                    // get item data
                    var item_api_url = item_obj[k].url;
                    emble.canvas_api.getItemData(item_api_url).then(function(item_data) {

                        var block_category = emble.database.block_category;
                        for (var i = 0; i < block_category.length; i++) {

                            var block_obj = block_category[i].block;
                            for (var k = 0; k < block_obj.length; k++) {
                                if (item_data.url == block_obj[k].id) {
                                    block_obj[k].html = item_data.body;
                                    block_obj[k].example_link = item_data.html_url;
                                    break;
                                } else if (item_data.url == block_obj[k].id + '-instructions' || item_data.url == block_obj[k].id + '-instruction') {
                                    block_obj[k].instruction = item_data.body;
                                    break;
                                }
                            }
                        }

                        no_completed += 1;
                        if (no_completed == no_item) {
                            //console.log('completed all calls');
                            resolve(true);
                        }
                    });
                }
            }
        });
    });


}
/*
Block Search

Purpose/Description: 
Allows user to filter the blocks based on a search query

Author(s):
Sam Malcolm, RMIT Studios

Contributor(s):
Edwin Ang, RMIT Online
*/
emble.ui.blockSearch = function(str) {
    return new Promise(function(resolve, reject) {
        /* search for through the block objects in the global variable */
        var block_category = JSON.parse(JSON.stringify(emble.database.block_category));

        if (str.length) {
            var regex = new RegExp('\\b' + str, 'gi');

            // loop block category (reverse loop to support splicing)
            for (var i = block_category.length - 1; i >= 0; i--) {

                // loop blocks
                var block = block_category[i].block;
                for (var k = block.length - 1; k >= 0; k--) {
                    // if name does not match, remove from the list
                    if (!block[k].name.match(regex)) {
                        block.splice(k, 1);
                    }
                }

                // if no blocks in category, remove the category
                if (block.length == 0) {
                    block_category.splice(i, 1);
                }
            }

            emble.database.filtered_block_category = block_category;
            resolve(block_category);
        } else {
            emble.database.filtered_block_category = block_category;
            resolve(true);
        }
    })
}
/*
Display Block Options

Purpose/Description: 
Display all the category and respective blocks in the Emble interface

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
emble.ui.displayBlockOptions = function(block_category) {
    return new Promise(function(resolve, reject) {

        var block_category_html = '';

        for (var i = 0; i < block_category.length; i++) {

            block_category_html += '<div id="category-' + i + '" class="block-category expanded">';
            block_category_html += '<div class="category-title"><i class="icon icon-arrow-open-down"></i><p>' + block_category[i].name + '</p></div>';

            block_category_html += '<div class="category-options">';
            block_category_html += '<div class="category-padding">';

            var block_obj = block_category[i].block;
            for (var k = 0; k < block_obj.length; k++) {
                block_category_html += '<div class="block-options" data-block-id="' + block_obj[k].id + '" data-category-name="' + block_category[i].name + '" data-block-name="' + block_obj[k].name + '">';
                block_category_html += '<p>' + block_obj[k].name + '</p>';
                block_category_html += '<button><i class="icon-question"></i></button>';
                block_category_html += '</div>';
            }

            block_category_html += '</div>';
            block_category_html += '</div>';
            block_category_html += '</div>';

            if (i == block_category.length - 1) {
                $('#emble-category').html(block_category_html);
                emble.ui.displayQuickAddOptions();
                resolve(true);
            }


        }


    });
};
/*
Display Dialog Box 

Purpose/Description: 
Display pop-up dialog box with content

Author(s):
Edwin Ang, RMIT Online

Contributor(s):

style="position:static;top:0px;left:0px;right:auto;bottom:auto;border-radius:0px;border:none;padding:0px;justify-content: flex-start;padding: 70px 0 70px 0;"

*/

emble.ui.displayDialog = function(modal_title, modal_body, action_btn_title, action_function, action_params) {

    var modal_html = '<div class="modal-container"><div style="background-color: rgba(0, 0, 0, 0.5);" class="ReactModal__Overlay ReactModal__Overlay--after-open ReactModal__Overlay--canvas"><div  class="ReactModal__Content ReactModal__Content--after-open ReactModal__Content--canvas"><div class="ReactModal__Layout"><div class="ReactModal__Header"><div class="ReactModal__Header-Title"><h4>' + modal_title + '</h4></div><div class="ReactModal__Header-Actions"><button class="modal-cancel-btn Button Button--icon-action" type="button"><i class="icon-x" ></i><span class="screenreader-only">Close</span></button></div></div>';

    modal_html += '<div class="ReactModal__Body">' + modal_body + '</div>';

    modal_html += '<div class="ReactModal__Footer"><div class="ReactModal__Footer-Actions"><button type="button" class="btn btn-default modal-cancel-btn">Cancel</button><button type="submit" class="btn btn-primary modal-action-btn">' + action_btn_title + '</button></div></div></div></div></div></div>';

    $('body').append(modal_html);

    $('.modal-container .modal-cancel-btn').off('click');
    $('.modal-container .modal-cancel-btn').on('click', function(e) {
        e.preventDefault();
        $('.modal-container').remove();
    });

    $('.modal-container .modal-action-btn').off('click');
    $('.modal-container .modal-action-btn').on('click', function(e) {
        e.preventDefault();
        if (action_params) {
            action_function(action_params);
        } else {
            action_function();
        }
        $('.modal-container').remove();
    });

};
/*
Display Emble Interface

Purpose/Description: 
Display the Emble interface in the page, replace the course navigation menu

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
Carly M
*/
emble.ui.displayInterface = function() {
    return new Promise(function(resolve, reject) {

        // interface += '<h4>Emble <i class="icon-question get-help" style="vertical-align: middle;" data-help="help-emble"></i></h4>';

        var interface = '<div id="emble-interface">\
                <div id="emble-menu-container">\
                    <a href="javascript:void(0)" id="toggle-emble" class="personal-menu-item btn" aria-live="polite" aria-label="Hide and Show Emble Menu" title="Hide and Show Emble Menu" data-show-emble="true">\
                    </a>\
                    <h4>Emble</h4>\
                    <a class="btn al-trigger" id="emble-more" tabindex="0" role="button" href="javascript:void(0)" aria-haspopup="true">\
                        <i class="icon-more" aria-hidden="true"></i>\
                        <span class="screenreader-only">Emble Menu</span>\
                    </a>\
                    <ul class="" id="embleMenu" role="menu" tabindex="0" aria-hidden="true" aria-expanded="false" style="width: 100%; margin-top: 3rem; display: none; padding: .25rem 0rem;">\
                        <li class="menu-item">\
                        <div class="emble_check" data-emble-checked="false" aria-role="checkbox" style="display:inline-block; width:16px; height:16px; display:inline-block; background-size:16px; background-position:top left; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAABACAYAAAB7jnWuAAAACXBIWXMAAAsSAAALEgHS3X78AAACzElEQVRoge2YP2gTURzHfw1FcbouDjplc4m9SAJCkCMQOcjkLQ52iFeRa6AZLqNOOkoGA2ZJlr5EzKgnKIWDYMnaDC20Li7poHSomkSi0DSNvPK7Eq/vchfTSwTfFw7uz3vv+7nf/d57995cJBJRASAPAAJMV20A0ClAawbmltqBGZpTCfPDV41GY24artFodGCdB6ZhOEocgANwAA7AATgAB+AAHIADcAAOQNeGAw/lfFMAV6mz0sniVJ8RxMny/J/IAb4/cKr/cn9g3kOZv5ZZqAVxA0yVM4kWqx3fImAWagsAYADAHQDYMAu18FQBqCkAiHguOkH4AmAWamTI3JKAEIqvAPiW9x0eU4imbwCluqk2F/ukdxFWHYb3ZTmT2PIFoFQ34wCwRkP/+Vpf+3bleMUGkZUzCWKvdy4ApboZxoy3JHYuD4oIsQ0AZTmTyLPqTjwOlOrmAma8fUgXKMRPob/64Lb8yqn+RBHYWV+i5vER80nz6AK8H9WGIwAxUmF6uDCQWJc8uXTcYSUdvY5rkswcAUcCoDEN6wYxUnFWmZ31JYKjnHjj12steLg5nHSezJkAxEjRsBIMKz0+ECOl2sx1W18Xr/Z2iwhBk07VJHnL3rYnANsQammNGKk8mlOY54x6AoWIdYmiSbLBeO4OgCZ2c0vqs5cvbrm0R0LJatOljDMAhp41grX3f9xcOeiK78p7ab3TE1hJVw4lq/o45mcAVKVCv1sQv+OpDo+Ex1+71x9hTohvvtzTNr/HhpNuG/+ux9aZHFCVSgv79lu8lf10cFezfRrxY2exiBBlWj6UrLpmPEt/rIzs/4Q0+3f3H8ZHzG57ubQUHNfU8z+hqlRoTjh1Jxp+xeGZZ7kOxbm0RHvGMiPp9Fxa8tTXR8nTXJBLSwTzwoLI4r2J5XkywrelEE8xKueisaZjhJg47MPi+wOz3R8A0H8DfVL2NgFkibsAAAAASUVORK5CYII=);">\
                        </div>\
                        <p style="display:inline-block; margin:0;">Show Emble by Default</p>\
                        </li>\
                        <li class="menu-item menu_emble_hover get-help" data-help="help-emble">\
                            <i class="icon-video" ></i>\
                            What is Emble? (Video)\
                        </li>\
                        <li class="menu-item menu_emble_hover">\
                            <i class="icon-pdf"></i>\
                            <a href="https://rmiteduau.sharepoint.com/sites/emble/Emble%20User%20Guides/Emble%20Functional%20List.pdf?web=1">Emble Guide (PDF)</a>\
                        </li>\
                        <li class="menu-item">\
                             <i class="icon-info"></i>\
                             <a href="https://rmititsm.service-now.com/sp">Get Help (Service Now)</a>\
                         </li>\
                    </ul>\
                </div>\
                <input type="text" placeholder="Search" class="searchbtn" id="searchFunction"/><div id="emble-category">\
            </div>';

        if (!$('#left-side #emble-interface').length) {
            $('#left-side').append(interface);

            document.querySelector(".emble_check").addEventListener("click", function(e) {
                if (this.getAttribute("data-emble-checked") == "true") {
                    this.style.backgroundPosition = "top";
                    this.setAttribute("data-emble-checked", "false");
                } else {
                    this.style.backgroundPosition = "bottom";
                    this.setAttribute("data-emble-checked", "true");
                }
                var settingValue = (this.getAttribute("data-emble-checked") == "true") ? true : false;
                emble.ui.setting.default_view_emble = settingValue;
                emble.canvas_api.putEmbleSetting(emble.ui.setting);
            });
        }

        document.querySelector(".emble_check").setAttribute('data-emble-check', emble.ui.setting.default_view_emble)

        if (emble.ui.setting.default_view_emble) {
            $('#toggle-emble').attr('data-show-emble', true);
            document.querySelector(".emble_check").style.backgroundPosition = "bottom";
            $('#left-side nav').toggle();
        } else {
            $('#toggle-emble').attr('data-show-emble', false);
            document.querySelector(".emble_check").style.backgroundPosition = "top";
            $('#left-side #emble-interface').toggle();
            emble.ui.updateToggleLink();
        }

        resolve(true);
    });
};

/*
Display Quick-add Options

Purpose/Description: 
Display Quick-add icon to blocks

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.ui.displayQuickAddOptions = function() {
    // if quick add is enabled
    if (emble.ui.setting.quick_add.enabled) {
        // loop category
        var quick_add_category = emble.ui.setting.quick_add.block_category;
        if (quick_add_category.length > 0) {
            for (var x = 0; x < quick_add_category.length; x++) {
                var category_name = quick_add_category[x].name;

                // loop blocks in category
                var quick_add_block = quick_add_category[x].block;
                for (var y = 0; y < quick_add_block.length; y++) {
                    // add quick-add icon
                    //                    $('.block-options[data-block-id="'+quick_add_block[y]+'"][data-category-name="'+category_name+'"]').addClass('quick-add');
                    $('.block-options[data-block-id="' + quick_add_block[y] + '"][data-category-name="' + category_name + '"] button').show();
                }
            }
        }

    } else {
        $('.block-options').removeClass('quick-add');
    }
}


/*
Handle help button in Emble interface

Purpose/Description: 
Show information on Emble, Quick-add or Deafult view when users click on the respective help button

Author(s):
Edwin Ang, RMIT Online

Contributor(s):

*/

var help_type = 'help-emble';

emble.ui.handleHelpBtn = function() {
    $('#emble-interface').on('click', 'li.get-help', function(e) {
        // prevent default checkbox change
        e.preventDefault();

        // function to close dialog box
        emble.ui.showWelcome('What is Emble');

    });
}

emble.ui.showWelcome = function(title) {

    console.log('showing welcome')

    var closeDialog = function() {
        $('.modal-container').remove()
    };



    // loop through help database to get instruction html
    var help_instruction = emble.database.help_instruction;
    for (var i = 0; i < help_instruction.length; i++) {
        if (help_type == help_instruction[i].page_id) {
            emble.ui.displayDialog(title, help_instruction[i].html, 'Got it', closeDialog, '');
            break;
        }
    }

}






/*
Handle Block Selection

Purpose/Description: 
When users select a block, display the block's instruction with dialog pop-up if quick-add is not enabled. If quick-add is enabled, insert the block into the rich content editor

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.ui.selectBlockOption = function() {

    // function to display instruction
    function displayInstructions(category_name, block_name, block_instruction_html, block_html) {
        var action_fn = emble.rce.insertBlockContent;
        emble.ui.displayDialog(category_name + ': ' + block_name, block_instruction_html, 'Add to page', action_fn, block_html);
    }

    // function to get element data (html, instrcution)
    function getInsertContentParameter(block_id, category_name) {

        var block_category = emble.database.block_category;

        for (var i = 0; i < block_category.length; i++) {

            var block_obj = block_category[i].block;
            for (var k = 0; k < block_obj.length; k++) {

                if (block_id == block_obj[k].id) {

                    var insertContentParameter = {
                        block_html: block_obj[k].html,
                        block_id: block_obj[k].id,
                        block_name: block_obj[k].name,
                        block_instruction: block_obj[k].instruction,
                        category_name: category_name,
                    }

                    return insertContentParameter;
                } else if (block_id != block_obj[k].id && k == block_obj.length - 1 && i == block_category.length - 1) {
                    return false;
                }
            }
        }
    }

    // click on element
    $('#emble-interface').on('click', '.block-options p', function() {
        var block_id = $(this).parent().attr('data-block-id');
        var category_name = $(this).parent().attr('data-category-name');


        var insertContentParameter = getInsertContentParameter(block_id, category_name);

        if (insertContentParameter) {
            // if quick add is enabled
            if (emble.ui.setting.quick_add.enabled) {
                // loop category
                var quick_add_category = emble.ui.setting.quick_add.block_category;
                if (quick_add_category.length > 0) {
                    loop_quick_add: for (var x = 0; x < quick_add_category.length; x++) {
                        var quick_add_category_name = quick_add_category[x].name;

                        // category exist, search block
                        if (category_name == quick_add_category_name) {
                            // loop blocks in category
                            var quick_add_block = quick_add_category[x].block;
                            for (var y = 0; y < quick_add_block.length; y++) {
                                // add quick-add icon
                                if (block_id == quick_add_block[y]) {
                                    emble.rce.insertBlockContent(insertContentParameter);
                                    break loop_quick_add;
                                } else if (y == quick_add_block.length - 1 && x == quick_add_category.length - 1 && block_id != quick_add_block[y]) {
                                    displayInstructions(category_name, insertContentParameter.block_name, insertContentParameter.block_instruction, insertContentParameter);
                                }
                            }
                        }

                        // category doesn not exist, add new category and block to quick-add setting
                        else if (x == quick_add_category.length - 1 && category_name != quick_add_category_name) {
                            displayInstructions(category_name, insertContentParameter.block_name, insertContentParameter.block_instruction, insertContentParameter);
                        }
                    }
                }
                else {
                    displayInstructions(category_name, insertContentParameter.block_name, insertContentParameter.block_instruction, insertContentParameter);
                }
            }

            // if quick add is not enable
            // display block instructions
            else {
                displayInstructions(category_name, insertContentParameter.block_name, insertContentParameter.block_instruction, insertContentParameter);
            }
        }
    });

    // click on element instruction button
    $('#emble-interface').on('click', '.block-options button', function() {
        var block_id = $(this).parent().attr('data-block-id');
        var category_name = $(this).parent().attr('data-category-name');

        var insertContentParameter = getInsertContentParameter(block_id, category_name);

        if (insertContentParameter) {
            displayInstructions(category_name, insertContentParameter.block_name, insertContentParameter.block_instruction, insertContentParameter);
        }
    });

}
/*
Toggle Block Category

Purpose/Description: 
Allow users to toggle (expand) the category in the Emble interface 

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
emble.ui.toggleBlockCategory = function() {
    $('#emble-interface').on('click', '.category-title', function() {
        if (!$(this).parent().hasClass('expanded')) {
            $(this).parent().addClass('expanded');
            $(this).children('i').addClass('icon-arrow-open-down');
            $(this).children('i').removeClass('icon-arrow-open-right');
        } else {
            $(this).parent().removeClass('expanded');
            $(this).children('i').removeClass('icon-arrow-open-down');
            $(this).children('i').addClass('icon-arrow-open-right');
        }

    });
}
/*
Toggle Emble Interface Menu

Purpose/Description: 
Allow users to toggle/change between the Emble and course navigation menu

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.ui.updateToggleLink = function() {
    var CBstatus = $('#left-side #emble-interface').css('display');

    if (CBstatus == 'block') {
        $('#toggle-emble')
            .attr('data-show-emble', true)
            .prependTo('#emble-menu-container');
    } else {
        $('#toggle-emble')
            .attr('data-show-emble', false)
            .wrap('<li class="section">')
            .parent()
            .insertBefore('#section-tabs .section:first-child');
    }

}

emble.ui.toggleEmbleInterfaceMenu = function() {


    $('#courseMenuToggle').on('click', function(e) {
        e.stopPropagation();

        $('#left-side nav').toggle();
        $('#left-side #emble-interface').toggle();

        emble.ui.updateToggleLink();
    });

    $('#toggle-emble').on('click', function(e) {
        e.preventDefault();

        $('#left-side nav').toggle();
        $('#left-side #emble-interface').toggle();

        emble.ui.updateToggleLink();
    });

}
/*
Editing Indicator

Purpose/Description: 
Indicate when users are editing on an element

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.rce.editingIndicator = function() {
    var editor = emble.rce.activeEditor;

    var current_selection = editor.selection.getNode();
    var emble_as_parent = editor.dom.getParents(current_selection, '*[data-edit-indicator]');

    if ($(current_selection).is('*[data-edit-indicator]') || emble_as_parent.length) {
        // get element with [data-edit-indicator]
        var edit_element;
        if ($(current_selection).is('*[data-edit-indicator]')) {
            emble_option_el = current_selection;
        } else {
            emble_option_el = emble_as_parent[0];
        }

        $(editor.dom.select('*[data-edit-indicator]')).attr('data-edit-indicator', false);

        $(emble_option_el).attr('data-edit-indicator', true);
    } else {
        $(editor.dom.select('*[data-edit-indicator]')).attr('data-edit-indicator', false);
    }
}
/*
Editor event

Purpose/Description:
Attach events with methods to editor

Author(s):
Edwin Ang, RMIT Online
Ghost Writer, RMIT Studios
Contributor(s):
*/

emble.rce.editorEvent = function() {
    var editor = emble.rce.activeEditor;

    // editor click event
    editor.on('click', function(e) {
        // editing indicator
        emble.rce.editingIndicator();

        // context menu tooltip
        emble.rce.contextMenuManager.displayContextMenu(e.target);
    });


    //    Remove because editor.off('keydown') cause issues with tinymce (such as undoManager)
    //    TODO: Find solution to prevent deleting of last <p> by backspace
    //    Found the solution, uncommented below code for functionality to work in Call out cards only at
    //    the moment. Refer to the raw html in Canvas to see full functionality. Seems to work fine with undoManager as well.

    editor.off('keydown');
    editor.on('keydown', function(e) {
        var key = e.which || e.keyCode || e.charCode;
        // press backspace or delete
        if (key == 8 || key == 46) {
            try {
                emble.rce.deleteManager.preventDelete(e);
            } catch (e) {}
        }

    });

    // editor keyup (keyboard) event
    editor.on('keyup', function(e) {
        var key = e.which || e.keyCode || e.charCode;

        // when user navigate within rce with keyboard
        if (key == 8 || key == 46 || key == 13 || key == 37 || key == 38 || key == 39 || key == 40) {
            // editing indicator
            emble.rce.editingIndicator();
            // context menu tooltip
            var editor = emble.rce.activeEditor;
            var current_el = editor.selection.getNode();
            emble.rce.contextMenuManager.displayContextMenu(current_el);
        }

        // key character legend
        // 8 - backspace
        // 46 - delete
        // 13 - enter
        // 37 - left
        // 38 - up
        // 39 - right
        // 40 - down

        //          Remove because editor.off('keydown') cause issues with tinymce (such as undoManager)
        //        emble.rce.deleteManager.setDeletable();
    });

    //    editor.onNodeChange.add(this.onTinyMCEEditorNodeChange.bind(this));

    editor.on('NodeChange', function(e) {
        var editor = emble.rce.activeEditor;

        //        emble.rce.deleteManager.setDeletable();
        //console.log('change');
        emble.rce.undoManager.updateBtnState();
        //
        emble.rce.removeHighlightIndicator(600);





        $(editor.dom.select('.video-container')).each(function() {
            if ($(this).find('iframe').length) {
                $(this).removeClass('no-video');

                var iframe_el = $(this).find('iframe');
                if ($(iframe_el).attr('src').match(/(external_tools).{1,}(rmit-arc.instructuremedia.com)/gi) && !$(iframe_el).attr('src').match(/(bare_embed)/gi)) {
                    $(this).addClass('arc-comment')
                }
            } else {
                $(this).addClass('no-video');
            }
        });


        emble.rce.hoverIndicator();
    });
}

/*
Generate Universally Unique Identifier (UUID)

Purpose/Description: 
Generates UUID to be able to identify between pop-up context menu and the customisable element

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.rce.generateUUID = function() {
    return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
/*
Get Tinymce Active Editor

Purpose/Description: 
Search and wait for tinymce active editor to load. Get access to tinymce API to customise rich content editor functionality.

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.rce.getActiveEditor = function() {
    return new Promise(function(resolve, reject) {
        var search_tinymce = setInterval(function() {
            var timer = 0;
            if (typeof tinymce !== 'undefined' && tinymce.hasOwnProperty('activeEditor') && tinymce.activeEditor) {
                //console.log('found active editor');
                emble.rce.activeEditor = tinymce.activeEditor;
                resolve(true);
                clearInterval(search_tinymce);
            } else if (timer == 200) {
                reject(false);
                clearInterval(search_tinymce);
            } else {
                timer += 1;
            }
        }, 250);
    });
}

emble.rce.hoverIndicator = function() {
    var editor = emble.rce.activeEditor;

    $(editor.dom.select('#tinymce')).on('mouseover mouseout', '[data-context-menu]', function(e) {
        e.stopPropagation();
        if (e.type == 'mouseover') {
            $(this).addClass('hover');
            // if( $('.element_name').length == -1 ){
            //  $(this).append('<span class="element_name">HELLO</span>')

            // }
        } else {
            $(this).removeClass('hover');
            $('.element_name').remove();
        }
    });
}

//emble.rce.contextMenuManager.hoverTest = function(){
//    var editor = emble.rce.activeEditor;
//    //console.log('---Handle context menu method');
//    
//    $(editor.dom.select('[data-edit-indicator]')).off( "mouseover mouseout" );
//    $(editor.dom.select('[data-edit-indicator]')).on('mouseover mouseout', function(e){
//        if(e.type == 'mouseover'){
//            $(this).attr('data-edit-indicator', 'true');
//        }else{
//            
//            $(this).attr('data-edit-indicator', 'false');
//        }
//    });
//    
//    var removeContextMenu;
//    
//    
//    
//    $(editor.dom.select('[data-context-menu]')).off( "mouseover mouseout" );
//    $(editor.dom.select('[data-context-menu]')).on('mouseover mouseout', function(e){
//        e.stopPropagation();
//        if(e.type == 'mouseover'){
//            $(this).addClass('selected');
//            emble.rce.contextMenuManager.displayContextMenu(this);
//            //console.log()
//            $('.context-menu-wrapper').off( "mouseover mouseout mouseenter mouseleave" );
//            $('.context-menu-wrapper').on( "mouseenter mouseleave",function(e){
//                if(e.type == 'mouseenter'){
//                    clearTimeout(removeContextMenu);
//                }
//                else{
//                    emble.rce.contextMenuManager.displayContextMenu(this);
//                }
//            });
//            
//        }else{
//            $(this).removeClass('selected');
//            removeContextMenu = setTimeout(function(){
//                emble.rce.contextMenuManager.destroyContextMenu();
//            },500);
//        }
//        //console.log(e.type+ ': '+$(this)[0].nodeName+', '+ $(this)[0].className);
//    });
//}
/*
Insert Block into RCE

Purpose/Description: 
Allow users to insert the block into the rich content editor

Author(s):
Edwin Ang, RMIT Online

Contributor(s):

*/

emble.rce.insertBlockContent = function(block_parameter) {
    var block_html = block_parameter.block_html;
    var block_id = block_parameter.block_id;
    var block_name = block_parameter.block_name;
    var category_name = block_parameter.category_name;

    // insert block hmtl into the rich content editor with highlight indicator wrapper
    emble.rce.activeEditor.insertContent('<div class="highlight-insert-indicator">' + block_html + '</div>');

    // TODO: add block name to element that was recently added
    //    var el = emble.rce.activeEditor.dom.select('.highlight-insert-indicator');
    //    $(el).children('[data-context-menu]').attr('data-block-name', block_name);
    //    
    //    //console.log(el);
    //    //console.log($(el).children('[data-context-menu]'));



    // update the quick add setting
    // loop category
    var quick_add_category = emble.ui.setting.quick_add.block_category;
    if (quick_add_category.length > 0) {
        for (var x = 0; x < quick_add_category.length; x++) {
            var quick_add_category_name = quick_add_category[x].name;

            // category exist, search block
            if (category_name == quick_add_category_name) {
                // loop blocks in category
                var quick_add_block = quick_add_category[x].block;
                for (var y = 0; y < quick_add_block.length; y++) {
                    // add quick-add icon
                    if (block_id == quick_add_block[y]) {
                        break;
                    } else if (y == quick_add_block.length - 1 && block_id != quick_add_block[y]) {
                        // add block to quick add setting
                        quick_add_category[x].block.push(block_id);
                        // api to update user CB setting
                        emble.canvas_api.putEmbleSetting(emble.ui.setting);
                        // show or hide quick add icon
                        emble.ui.displayQuickAddOptions();
                    }
                }
            }

            // category doesn not exist, add new category and block to quick-add setting
            else if (x == quick_add_category.length - 1 && category_name != quick_add_category_name) {
                // add category and block to quick add setting
                emble.ui.setting.quick_add.block_category.push({
                    name: category_name,
                    block: [block_id]
                });
                // api to update user CB setting
                emble.canvas_api.putEmbleSetting(emble.ui.setting);
                // show or hide quick add icon
                emble.ui.displayQuickAddOptions();
            }
        }
    } else {
        // add category and block to quick add setting
        emble.ui.setting.quick_add.block_category.push({
            name: category_name,
            block: [block_id]
        });
        // api to update user CB setting
        emble.canvas_api.putEmbleSetting(emble.ui.setting);
        // show or hide quick add icon
        emble.ui.displayQuickAddOptions();
    }

    // remove highlight indicator wrapper after 600ms
    emble.rce.removeHighlightIndicator(600);
}
/*
Insert CSS into RCE

Purpose/Description: 
Insert RMIT and CB CSS into the RCE to allow users to view the block as they are intended to be.

Author(s):
Edwin Ang, RMIT Online

Contributor(s):

*/

emble.rce.insertCSStoRCE = function() {
    return new Promise(function(resolve, reject) {
        var url_combine = '';
        $('link').each(function() {
            if (($(this).attr('href').match(/(instructure-uploads).{1,}(.css)$/gi) || $(this).attr('href').match(/(brandable_css).{1,}(common).{1,}(.css)$/gi)) && $(this).attr('rel') == "stylesheet") {
                url_combine += $(this).attr('href') + ',';
            }
        });
        url_combine = url_combine.slice(0, -1);
        emble.rce.activeEditor.dom.loadCSS(url_combine);
        resolve(true);
    });

}
/*
Remove Hightlight Insert Indicator

Purpose/Description: 
Remove highlight insert indicator after 1s

Author(s):
Edwin Ang, RMIT Online

Contributor(s):

*/

emble.rce.removeHighlightIndicator = function(delay_time) {
    if (emble.rce.activeEditor.dom.select('.highlight-insert-indicator').length) {
        setTimeout(function() {
            if (emble.rce.activeEditor.dom.select('.highlight-insert-indicator').length) {
                var highlight_container = emble.rce.activeEditor.dom.select('.highlight-insert-indicator')[0];
                // var block_html = '<p class="insertHighlighter">' + highlight_container.innerHTML;
                var block_html = highlight_container.innerHTML;


                emble.rce.activeEditor.selection.select(highlight_container);
                emble.rce.activeEditor.selection.setContent(block_html);
            }
        }, delay_time);
    }
}

emble.rce.contextMenuManager.addMenuItem = function(itemParamenter) {

    if (itemParamenter.hasOwnProperty('icon') && itemParamenter.icon && itemParamenter.hasOwnProperty('label') && itemParamenter.label &&
        itemParamenter.hasOwnProperty('id') && itemParamenter.id &&
        itemParamenter.hasOwnProperty('onAction') && itemParamenter.onAction) {
        emble.rce.contextMenuManager.menuItem.push(itemParamenter)
    }
}
/*
Calculate Context Menu Position

Purpose/Description: 
Calculates the pop-up context menu position and set the position

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.rce.contextMenuManager.calculateMenuPosition = function(selected_element_node, menu_uuid) {
    // get menu width and height 
    var menu_rect = $('.context-menu-wrapper[data-id="' + menu_uuid + '"]')[0].getBoundingClientRect();
    emble.rce.contextMenuManager.rect.width = menu_rect.width;
    emble.rce.contextMenuManager.rect.height = menu_rect.height;
    // get rect for rce iframe
    var rce_rect = emble.rce.activeEditor.iframeElement.getBoundingClientRect();
    // get rect for target element
    var element_rect = $(selected_element_node)[0].getBoundingClientRect();
    //get window scrollY value
    var window_scrollY = window.scrollY;

    // calculate x position
    // if element is larger than iframe
    if (element_rect.width >= rce_rect.width) {
        emble.rce.contextMenuManager.rect.x = rce_rect.x + (rce_rect.width - emble.rce.contextMenuManager.rect.width) / 2;
    } else {
        emble.rce.contextMenuManager.rect.x = rce_rect.x + element_rect.x + ((element_rect.width - emble.rce.contextMenuManager.rect.width) / 2);
    }

    // calculate y position
    // if there is no space at the top, display menu at the bottom
    if (element_rect.y <= 50) {
        // recalculate context menu y position
        emble.rce.contextMenuManager.rect.y = rce_rect.y + element_rect.y + window_scrollY + element_rect.height + emble.rce.contextMenuManager.rect.pointer;
        emble.rce.contextMenuManager.rect.pointer_position_class = 'pointer-top';
    } else {
        emble.rce.contextMenuManager.rect.y = element_rect.y + rce_rect.y + window_scrollY - emble.rce.contextMenuManager.rect.height - emble.rce.contextMenuManager.rect.pointer;
        emble.rce.contextMenuManager.rect.pointer_position_class = 'pointer-bottom';
    }

    // set position
    $('.context-menu-wrapper[data-id="' + menu_uuid + '"]').css({
        visibility: 'visible',
        left: emble.rce.contextMenuManager.rect.x,
        top: emble.rce.contextMenuManager.rect.y,
    });
    // add pointer class
    $('.context-menu-wrapper[data-id="' + menu_uuid + '"]').addClass(emble.rce.contextMenuManager.rect.pointer_position_class);
};
emble.rce.contextMenuManager.createContextMenu = function(item_list, uuid, el_name) {
    // generate context menu

    if (el_name != undefined) {
        var context_menu_html = '<div class="context-menu-wrapper" style="visibility: hidden;" data-id="' + uuid + '"><div class="context-menu-inner-wrapper"><span class="elementName">' + el_name + '</span>';

    } else {
        var context_menu_html = '<div class="context-menu-wrapper" style="visibility: hidden;" data-id="' + uuid + '"><div class="context-menu-inner-wrapper">';

    }


    for (var j = 0; j < item_list.length; j++) {

        if (item_list[j].hasOwnProperty('icon_bg') && item_list[j].icon_bg) {

            context_menu_html += '<button class="' + item_list[j].id + '"><i class="' + item_list[j].icon + '" style="background-image: url(' + item_list[j].icon_bg + ');"></i><span>' + item_list[j].label + '</span></button>';
        } else {

            context_menu_html += '<button class="' + item_list[j].id + '"><i class="' + item_list[j].icon + '"></i><span>' + item_list[j].label + '</span></button>';
        }

        if (j != item_list.length - 1) {
            context_menu_html += ' | ';
        }
    }

    context_menu_html += '</div></div>';

    return context_menu_html;
}
// customise element
emble.rce.contextMenuManager.addMenuItem({
    icon: 'icon-materials-required',
    label: 'Customise',
    id: 'customise',
    onAction: function(e) {
        emble.rce.customiseManager.displayCustomiseMenu(e.data.context_menu_el);
    }
});

// delete element
emble.rce.contextMenuManager.addMenuItem({
    icon: 'icon-trash',
    label: 'Delete',
    id: 'delete',
    onAction: function(e) {
        $(e.data.context_menu_el).replaceWith('<p><br></p>');
    }
});

// open rce arc
emble.rce.contextMenuManager.addMenuItem({
    icon: 'icon-Arc icon-Solid',
    label: 'Studio',
    id: 'rce-arc',
    onAction: function(e) {
        emble.rce.openArc();
    }
});

// open rce embed image tool
emble.rce.contextMenuManager.addMenuItem({
    icon: 'mce-ico mce-i-image',
    label: 'Image',
    id: 'rce-img',
    onAction: function(e) {
        emble.rce.openImg();
    }
});

// open rce youtube
emble.rce.contextMenuManager.addMenuItem({
    icon: 'mce-ico mce-i-none',
    icon_bg: 'https://www.edu-apps.org/assets/lti_public_resources/youtube_icon.png',
    label: 'YouTube',
    id: 'rce-youtube',
    onAction: function(e) {
        emble.rce.openYoutube();
    }
});

// open rce Link to URL tool
emble.rce.contextMenuManager.addMenuItem({
    icon: 'mce-ico mce-i-link',
    label: 'Link to URL',
    id: 'rce-link',
    onAction: function(e) {
        emble.rce.openLink();
    }
});
emble.rce.contextMenuManager.deleteMenuItem = function(itemID) {
    var context_menu_list = emble.rce.contextMenuManager.menuItem;
    for (var k = 0; k < context_menu_list.length; k++) {
        if (itemID == context_menu_list[k].id) {
            context_menu_list.splic(k, i);
        }
    }
}
/*
Destroy Context Menu

Purpose/Description: 
Destroy the pop-up context menu

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.rce.contextMenuManager.destroyContextMenu = function() {

    var editor = emble.rce.activeEditor;

    // remove uuid
    $(editor.dom.select('[context-menu]')).removeAttr('id');

    // remove context menu
    $('.context-menu-wrapper').remove();

    // remove scroll event in main window
    $(window).off("scroll", emble.rce.contextMenuManager.destroyContextMenu);
    // remove scroll event in rce window
    $(editor.getWin()).off("scroll", emble.rce.contextMenuManager.destroyContextMenu);
};
/*
Handle Contenxt Menu Interface

Purpose/Description: 
Create pop-up context menu, insert context menu into DOM, map customisation options

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.rce.contextMenuManager.displayContextMenu = function(current_el) {
    var editor = emble.rce.activeEditor;

    //    var current_el = editor.selection.getNode();
    var parent_el = editor.dom.getParents(current_el, '[data-context-menu]');

    // destroy any existing context menu
    if ($('.context-menu-wrapper').length) {
        editor.dom.removeClass(editor.dom.select('[data-context-menu]'), 'selected');
        emble.rce.contextMenuManager.destroyContextMenu();
    }

    // run if element has context menu attr
    if ($(current_el).attr('data-context-menu') || parent_el.length && $(parent_el).attr('data-context-menu')) {
        // generate uuid
        var uuid = 'emble-customise-' + emble.rce.generateUUID();

        // get element with context menu attr class
        var context_menu_el;
        if ($(current_el).attr('data-context-menu')) {
            context_menu_el = current_el;
        } else {
            context_menu_el = parent_el[0];
        }

        // add uuid and 'selected' class to element
        $(context_menu_el).addClass('selected');
        $(context_menu_el).attr('id', uuid);

        // get all items specified
        var context_menu_item = $(context_menu_el).attr('data-context-menu').split(' ');
        var context_menu_list = emble.rce.contextMenuManager.menuItem;
        var el_name = $(context_menu_el).attr('data-emble-name');
        // console.log('what is ' + el_name)

        var context_menu_parms = [];
        for (var i = 0; i < context_menu_item.length; i++) {
            for (var k = 0; k < context_menu_list.length; k++) {
                if (context_menu_item[i] == context_menu_list[k].id) {
                    context_menu_parms.push(context_menu_list[k]);
                }
            }
        }

        // insert context menu to dom
        $('body').append(
            // create context menu and items
            emble.rce.contextMenuManager.createContextMenu(context_menu_parms, uuid, el_name)
        );

        // calculate context menu position
        emble.rce.contextMenuManager.calculateMenuPosition(context_menu_el, uuid, el_name);

        // remove context menu on scroll
        emble.rce.contextMenuManager.eventToRemove();

        // add click event to context menu
        for (var j = 0; j < context_menu_parms.length; j++) {
            // action fn for the item
            $('.context-menu-wrapper button.' + context_menu_parms[j].id).one('click', {
                context_menu_el: context_menu_el
            }, context_menu_parms[j].onAction);

            // destroy context menu
            $('.context-menu-wrapper button.' + context_menu_parms[j].id).one('click', emble.rce.contextMenuManager.destroyContextMenu);
        }

    } else {
        // remove any selected class
        editor.dom.removeClass(editor.dom.select('[data-context-menu]'), 'selected');

        // remove context menu
        emble.rce.contextMenuManager.destroyContextMenu();
    }








    //    var current_selection = editor.selection.getNode();
    //    var parent_customise = editor.dom.getParents(current_selection,'.emble-customise');
    //    var parent_delete = editor.dom.getParents(current_selection,'.emble-delete');
    //    
    //    // destroy any existing menu
    //    if($('.context-menu-wrapper').length){
    //        emble.rce.contextMenuManager.destroyContextMenu();
    //    }
    //
    //    // check if clicked on emble-customise element or emble-customise child
    //    if($(current_selection).hasClass('emble-customise') || parent_customise.length){
    //
    //
    //        // get element with emble-customise class
    //        var emble_option_el;
    //        if($(current_selection).hasClass('.emble-customise')){
    //            emble_option_el = current_selection;
    //        }
    //        else{
    //            emble_option_el = parent_customise[0];
    //        }
    //        
    //        
    //        
    //        // only display context menu if element has data-emble-customise attribute
    //        if($(emble_option_el).attr('data-emble-customise')){
    //            
    //            // generate uuid
    //            var uuid = 'emble-customise-' + emble.rce.contextMenuManager.generateUUID();
    //            
    //            
    //            
    //            // add class selected
    //            $(emble_option_el).addClass('selected');
    //            // add uuid
    //            $(emble_option_el).attr('id', uuid);
    //            
    //            if($(emble_option_el).attr('data-emble-customise').match(/(rce-arc)/gi)){
    //                // insert menu into DOM
    //                $('body').append('<div class="context-menu-wrapper" data-id="'+uuid+'" style="visibility: hidden;"><div class="context-menu-inner-wrapper"><button class="customise-btn"><i class="icon-Arc icon-Solid"></i><span>Arc</span></button> | <button class="delete-btn"><i class="icon-trash"></i><span>Delete</span></button></div></div>');
    //            }else{
    //                $('body').append('<div class="context-menu-wrapper" data-id="'+uuid+'" style="visibility: hidden;"><div class="context-menu-inner-wrapper"><button class="customise-btn"><i class="icon-materials-required"></i><span>Customise</span></button> | <button class="delete-btn"><i class="icon-trash"></i><span>Delete</span></button></div></div>');
    //            }
    //
    //            
    //
    //            // calculate menu position
    //            emble.rce.contextMenuManager.calculateMenuPosition(emble_option_el, uuid);
    //            
    //            // remove menu on scroll
    //            emble.rce.contextMenuManager.eventToRemove();
    //            
    //            $('.context-menu-wrapper[data-id="'+uuid+'"] .delete-btn').one('click',function(){
    ////                editor.dom.remove(editor.dom.select('#'+uuid+'.emble-customise'));
    //                $(editor.dom.select('#'+uuid+'.emble-customise')).replaceWith('<p><br></p>');
    //                emble.rce.contextMenuManager.destroyContextMenu();
    //                
    //            });
    //            
    //            // catch rce options (open rce tool instead of customisation menu)
    //            if($(emble_option_el).attr('data-emble-customise').match(/^(rce-)/gi)){
    //                $('.context-menu-wrapper[data-id="'+uuid+'"] .customise-btn').on('click',function(){
    //                    emble.rce.openRCETool($(emble_option_el).attr('data-emble-customise'));
    //                });
    //            }
    //            // catch customise groups
    //            else{
    //                // get customise group in array
    //                var customise_group = $(emble_option_el).attr('data-emble-customise').split(' ');
    //                var customise_group_obj = [];
    //
    //                // loop specified customise group and generate obj
    //                for(var i=0;i<customise_group.length;i++){
    //
    //                    // loop database customise group
    //                    var customise_group_database = emble.database.customise_option.option_group;
    //                    loop_database_customise_option:
    //                    for(var k=0;k<customise_group_database.length;k++){
    //
    //                        // if specified customise group exist in database 
    //                        if(customise_group[i] == customise_group_database[k].id){
    //                            var customise_group_option = JSON.parse(JSON.stringify(customise_group_database[k]));
    //
    //                            if($(emble_option_el).attr('data-'+customise_group[i])){
    //                                var custom_option_arr = $(emble_option_el).attr('data-'+customise_group[i]).split(' ');
    //                                customise_group_option.custom_option = [];
    //                                for(var x=0;x<custom_option_arr.length;x++){
    //                                    customise_group_option.custom_option.push({class:custom_option_arr[x]});
    //                                }
    //
    //                            }
    //                            customise_group_obj.push(customise_group_option);
    //                            break loop_database_customise_option;
    //                        }
    //                        // if this is a custom option, create new parameter
    //                        else if(customise_group[i] != customise_group_database[k].id && k == customise_group_database.length - 1){
    //                            if($(emble_option_el).attr('data-'+customise_group[i])){
    //                                var label_pre = customise_group[i].replace(/-/g, ' ');
    //                                var new_group_option = {
    //                                    label: label_pre.charAt(0).toUpperCase() + label_pre.slice(1),
    //                                    id: customise_group[i],
    //                                    target_element: '#'+uuid+'.emble-customise',
    //                                    custom_option: []
    //                                };
    //
    //                                var custom_option_arr = $(emble_option_el).attr('data-'+customise_group[i]).split(' ');
    //                                for(var x=0;x<custom_option_arr.length;x++){
    //                                    new_group_option.custom_option.push({class:custom_option_arr[x]});
    //                                }
    //                                customise_group_obj.push(new_group_option);
    //                            }
    //                        }
    //                    }
    //
    //                }
    //                
    //                // create customisation menu on click
    //                $('.context-menu-wrapper[data-id="'+uuid+'"] .customise-btn').one('click',function(){
    //                    emble.rce.contextMenuManager.displayCustomiseMenu(uuid, $(emble_option_el)[0].outerHTML, customise_group_obj);
    //                });
    //                
    //            }
    //            
    //            
    //        }       
    //    }
    //    else{
    //        // remove any selected class
    //        editor.dom.removeClass(editor.dom.select('.emble-customise'), 'selected');
    //
    //        // remove context menu
    //        emble.rce.contextMenuManager.destroyContextMenu();
    //    }
    //    
    //    
    //    
    //    if($(current_selection).hasClass('emble-delete') || parent_delete.length){
    //        // get element with emble-customise class
    //        var emble_option_el;
    //        if($(current_selection).hasClass('.emble-delete')){
    //            emble_option_el = current_selection;
    //        }
    //        else{
    //            emble_option_el = parent_delete[0];
    //        }
    //        
    //
    //        // generate uuid
    //        var uuid = 'emble-customise-' + emble.rce.contextMenuManager.generateUUID();
    //
    //        // destroy any existing menu
    ////        if($('.context-menu-wrapper').length){
    ////            emble.rce.contextMenuManager.destroyContextMenu();
    ////        }
    //
    //        
    //        // add uuid
    //        $(emble_option_el).attr('id', uuid);
    //        
    //        // insert menu into DOM
    //        $('body').append('<div class="context-menu-wrapper" data-id="'+uuid+'" style="visibility: hidden;"><div class="context-menu-inner-wrapper"><button class="delete-btn"><i class="icon-trash"></i><span>Delete</span></button></div></div>');
    //        
    //        
    //        // calculate menu position
    //        emble.rce.contextMenuManager.calculateMenuPosition(emble_option_el, uuid);
    //
    //        // remove menu on scroll
    //        emble.rce.contextMenuManager.eventToRemove();
    //
    //        $('.context-menu-wrapper[data-id="'+uuid+'"] .delete-btn').one('click',function(){
    //    //                editor.dom.remove(editor.dom.select('#'+uuid+'.emble-customise'));
    //            $(editor.dom.select('#'+uuid+'.emble-delete')).replaceWith('<p><br></p>');
    //            emble.rce.contextMenuManager.destroyContextMenu();
    //
    //        });
    //    }
    //    else{
    //        // remove any selected class
    //        editor.dom.removeClass(editor.dom.select('.emble-customise'), 'selected');
    //
    //        // remove context menu
    //        emble.rce.contextMenuManager.destroyContextMenu();
    //    }

}

/*
Event To Remove Context Menu

Purpose/Description: 
Remove context menu at certain events - when users scroll in main window, when users scroll in the rce window, when users switch between rce and HMTL editor

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/

emble.rce.contextMenuManager.eventToRemove = function() {
    // remove context menu when scrolling in main window
    $(window).scroll(emble.rce.contextMenuManager.destroyContextMenu);

    // remove context menu when scrolling in rce window
    $(emble.rce.activeEditor.getWin()).scroll(emble.rce.contextMenuManager.destroyContextMenu);

    // remove context menu when switch to HTML editor
    $('.switch_views').live('click', function() {
        emble.rce.contextMenuManager.destroyContextMenu();
    });
};
emble.rce.customiseManager.addCustomiseItem = function(itemParamenter) {

    if (itemParamenter.hasOwnProperty('target_element') && itemParamenter.target_element && itemParamenter.hasOwnProperty('label') && itemParamenter.label &&
        itemParamenter.hasOwnProperty('id') && itemParamenter.id &&
        itemParamenter.hasOwnProperty('option') && itemParamenter.option) {

        emble.rce.customiseManager.customiseItem.push(itemParamenter);
    }
};
emble.rce.customiseManager.createCustomiseItem = function(context_menu_el, customise_parameter) {

    var editor = emble.rce.activeEditor;
    var uuid = $(context_menu_el).attr('id');
    var example_body = '<fieldset><legend>Preview changes</legend><div class="preview-container">' + $(context_menu_el)[0].outerHTML + '</div></fieldset>';

    var customise_option_body = '<fieldset><legend>Customise options</legend><div class="customise-option-container bootstrap-form form-horizontal">';


    for (var i = 0; i < customise_parameter.length; i++) {

        // get from database option or specified custom option
        var option = customise_parameter[i].option;
        if (customise_parameter[i].hasOwnProperty('custom_option') && customise_parameter[i].custom_option.length > 0) {
            option = customise_parameter[i].custom_option;
        }

        // control for the group
        customise_option_body += '<div class="control-group">';

        // control group label
        customise_option_body += '<label class="control-label">' + customise_parameter[i].label + '</label>';

        // controls
        customise_option_body += '<div class="controls">';



        if (customise_parameter[i].option_type == 'display-checkbox') {
            // display-checkbox
            customise_option_body += '<div class="display-checkbox-container">';

            for (var k = 0; k < option.length; k++) {

                var target_element, target_selector;
                if ($(editor.dom.select('#' + uuid + '[data-context-menu]')).is(customise_parameter[i].target_element)) {
                    target_selector = '#' + uuid + '[data-context-menu]';

                    target_element = editor.dom.select(target_selector);
                } else {
                    target_selector = '#' + uuid + '[data-context-menu] ' + customise_parameter[i].target_element;

                    target_element = editor.dom.select('#' + uuid + '[data-context-menu] ' + customise_parameter[i].target_element);
                }

                var borderClass = 'has-border';

                if (option[k].class.match(/(border-)[a-z]{1,}/gi)) {
                    borderClass = '';
                }

                if ($(target_element).hasClass(option[k].class)) {
                    customise_option_body += '<div class="display-checkbox-option selected ' + borderClass + ' ' + option[k].class + '" data-option-group="' + customise_parameter[i].id + '" data-option="' + option[k].class + '" data-target="' + target_selector + '">';
                } else {
                    customise_option_body += '<div class="display-checkbox-option ' + borderClass + ' ' + option[k].class + '" data-option-group="' + customise_parameter[i].id + '" data-option="' + option[k].class + '" data-target="' + target_selector + '">';
                }

                if (customise_parameter[i].id == 'icon') {
                    if (option[k].name) {
                        customise_option_body += '<i class="icon ' + option[k].class + '"></i><span>' + option[k].name + '</span>';
                    } else {
                        customise_option_body += '<i class="icon ' + option[k].class + '"></i><span>' + option[k].class + '</span>';
                    }

                } else {
                    if (option[k].name) {
                        customise_option_body += '<p>' + option[k].name + '</p>';
                    } else {
                        customise_option_body += '<p>' + option[k].class + '</p>';
                    }

                }





                customise_option_body += '</div>';
            }

            customise_option_body += '</div>';
        }

        //Code Changes for embedding the h5p content in modal container
        else if (customise_parameter[i].option_type == 'display-textarea') {
            customise_option_body += '<textarea rows="4" cols="50"></textarea>'
        }
        // dropdown and others
        else {
            // select
            customise_option_body += '<select class="input-xlarge" name="' + customise_parameter[i].id + '" data-option-group="' + customise_parameter[i].id + '" data-target="' + customise_parameter[i].target_element + '">';

            for (var k = 0; k < option.length; k++) {

                var target_element, target_selector;
                if ($(editor.dom.select('#' + uuid + '[data-context-menu]')).is(customise_parameter[i].target_element)) {
                    target_selector = '#' + uuid + '[data-context-menu]';

                    target_element = editor.dom.select(target_selector);
                } else {
                    target_selector = '#' + uuid + '[data-context-menu] ' + customise_parameter[i].target_element;

                    target_element = editor.dom.select('#' + uuid + '[data-context-menu] ' + customise_parameter[i].target_element);
                }

                if ($(target_element).hasClass(option[k].class)) {
                    customise_option_body += '<option value="' + option[k].class + '" selected>';
                } else {
                    customise_option_body += '<option value="' + option[k].class + '">';
                }

                if (option[k].hasOwnProperty('name') && option[k].name) {
                    customise_option_body += option[k].name + '</option>';
                } else {
                    customise_option_body += option[k].class + '</option>';
                }
            }

            customise_option_body += '</select>';
        }

        customise_option_body += '</div>'; // controls
        customise_option_body += '</div>'; // control-group









        //        // options
        //        if(customise_parameter[i].id == 'icon'){
        //            // display-checkbox
        //            customise_option_body += '<div class="display-checkbox-container">';
        //
        //            for(var k=0;k<option.length;k++){
        //
        //                var target_element,target_selector;
        //                if($(editor.dom.select('#'+uuid+'[data-context-menu]')).is(customise_parameter[i].target_element)){
        //                    target_selector = '#'+uuid+'[data-context-menu]';
        //
        //                    target_element = editor.dom.select(target_selector);
        //                }else{
        //                    target_selector = '#'+uuid+'[data-context-menu] '+customise_parameter[i].target_element;
        //
        //                    target_element = editor.dom.select('#'+uuid+'[data-context-menu] '+customise_parameter[i].target_element);
        //                }
        //
        //                if($(target_element).hasClass(option[k].class)){
        //                    customise_option_body += '<div class="display-checkbox-option has-border selected" data-option-group="'+customise_parameter[i].id+'" data-option="'+option[k].class+'" data-target="'+target_selector+'">';
        //                }else{
        //                    customise_option_body += '<div class="display-checkbox-option has-border" data-option-group="'+customise_parameter[i].id+'" data-option="'+option[k].class+'" data-target="'+target_selector+'">';
        //                }
        //
        //                customise_option_body += '<i class="icon '+option[k].class+'"></i>';
        //                customise_option_body += '</div>';
        //            }
        //
        //            customise_option_body += '</div>';
        //        }
        //        else if(customise_parameter[i].id == 'button-theme' || customise_parameter[i].id == 'column-theme' || customise_parameter[i].id == 'bg-color' || customise_parameter[i].id == 'border-color'){
        //            // display-checkbox
        //            customise_option_body += '<div class="display-checkbox-container">';
        //
        //            for(var k=0;k<option.length;k++){
        //
        //                var target_element,target_selector;
        //                if($(editor.dom.select('#'+uuid+'[data-context-menu]')).is(customise_parameter[i].target_element)){
        //                    target_selector = '#'+uuid+'[data-context-menu]';
        //
        //                    target_element = editor.dom.select(target_selector);
        //                }else{
        //                    target_selector = '#'+uuid+'[data-context-menu] '+customise_parameter[i].target_element;
        //
        //                    target_element = editor.dom.select('#'+uuid+'[data-context-menu] '+customise_parameter[i].target_element);
        //                }
        //
        //                var borderClass = 'has-border';
        //
        //                if(customise_parameter[i].id == 'border-color'){
        //                    borderClass = '';
        //                }
        //
        //                if($(target_element).hasClass(option[k].class)){
        //                    customise_option_body += '<div class="display-checkbox-option selected '+borderClass+' '+option[k].class+'" data-option-group="'+customise_parameter[i].id+'" data-option="'+option[k].class+'" data-target="'+target_selector+'">';
        //                }else{
        //                    customise_option_body += '<div class="display-checkbox-option '+borderClass+' '+option[k].class+'" data-option-group="'+customise_parameter[i].id+'" data-option="'+option[k].class+'" data-target="'+target_selector+'">';
        //                }
        //
        //                if(option[k].hasOwnProperty('name') && option[k].name){
        //                    customise_option_body += '<p>'+option[k].name+'</p>';
        //                }else{
        //                    customise_option_body += '<p>'+option[k].class+'</p>';
        //                }
        //
        //                customise_option_body += '</div>';
        //            }
        //
        //            customise_option_body += '</div>';
        //        }
        //        else{
        //            // select
        //            customise_option_body += '<select class="input-xlarge" name="'+customise_parameter[i].id+'" data-option-group="'+customise_parameter[i].id+'" data-target="'+customise_parameter[i].target_element+'">';
        //
        //            for(var k=0;k<option.length;k++){
        //
        //                var target_element,target_selector;
        //                if($(editor.dom.select('#'+uuid+'[data-context-menu]')).is(customise_parameter[i].target_element)){
        //                    target_selector = '#'+uuid+'[data-context-menu]';
        //
        //                    target_element = editor.dom.select(target_selector);
        //                }else{
        //                    target_selector = '#'+uuid+'[data-context-menu] '+customise_parameter[i].target_element;
        //
        //                    target_element = editor.dom.select('#'+uuid+'[data-context-menu] '+customise_parameter[i].target_element);
        //                }
        //
        //                if($(target_element).hasClass(option[k].class)){
        //                    customise_option_body += '<option value="'+option[k].class+'" selected>';
        //                }
        //                else{
        //                    customise_option_body += '<option value="'+option[k].class+'">';
        //                }
        //
        //                if(option[k].hasOwnProperty('name') && option[k].name){
        //                    customise_option_body += option[k].name+'</option>';
        //                }else{
        //                    customise_option_body += option[k].class+'</option>';
        //                }
        //            }
        //
        //            customise_option_body += '</select>';
        //        }
        //
        //        customise_option_body += '</div>'; // controls
        //        customise_option_body += '</div>'; // control-group
    }


    customise_option_body += '</div></fieldset>'; // fieldset

    var dialog_body = example_body + customise_option_body;

    return dialog_body;
}
// button theme
emble.rce.customiseManager.addCustomiseItem({
    label: "Button theme",
    id: "button-theme",
    target_element: "[class^=btn]",
    option_type: 'display-checkbox',
    option: [{
        name: "Default",
        class: "btn-default"
    }, {
        name: "Primary",
        class: "btn-primary"
    }, {
        name: "Secondary",
        class: "btn-secondary"
    }, {
        name: "Warning",
        class: "btn-warning"
    }, {
        name: "Danger",
        class: "btn-danger"
    }, {
        name: "Success",
        class: "btn-success"
    }, {
        name: "Info",
        class: "btn-info"
    }]
});

// icon
emble.rce.customiseManager.addCustomiseItem({
    label: "Icon",
    id: "icon",
    target_element: "i[class*=icon-]",
    option_type: 'display-checkbox',
    option: [{
            name: "None",
            class: "icon-none"
        }, {
            name: "Calculator",
            class: "icon-calculator"
        }, {
            name: "Download",
            class: "icon-circle-arrow-down"
        }, {
            name: "Cloud Download",
            class: "icon-cloud-download"
        }, {
            name: "External Link",
            class: "icon-external-link"
        }, {
            name: "Check",
            class: "icon-check"
        }, {
            name: "Image",
            class: "icon-image"
        }, {
            name: "Add",
            class: "icon-add"
        }, {
            name: "Book",
            class: "icon-courses"
        }, {
            name: "Gradebook",
            class: "icon-gradebook"
        }, {
            name: "Media",
            class: "icon-attach-media"
        }, {
            name: "Video",
            class: "icon-video"
        }, {
            name: "Pencil",
            class: "icon-edit"
        }, {
            name: "Document",
            class: "icon-document"
        }, {
            name: "PDF",
            class: "icon-pdf"
        }, {
            name: "Audio",
            class: "icon-audio"
        }, {
            name: "Announcement",
            class: "icon-announcement"
        }, {
            name: "Go",
            class: "icon-arrow-end"
        }, {
            name: "Assignment",
            class: "icon-assignment"
        }, {
            name: "Calendar",
            class: "icon-calendar-month"
        }, {
            name: "Chat",
            class: "icon-chat"
        }, {
            name: "Comment",
            class: "icon-comment"
        }, {
            name: "Group",
            class: "icon-group"
        }

    ]
});

// Column number
emble.rce.customiseManager.addCustomiseItem({
    label: "Column number",
    id: "column-number",
    target_element: "div[class*=col-]",
    option_type: 'dropdown',
    option: [{
        name: "Two",
        class: "col-md-6 col-lg-6"
    }, {
        name: "Three",
        class: "col-md-4 col-lg-4"
    }]
});

// column theme
emble.rce.customiseManager.addCustomiseItem({
    label: "Column theme",
    id: "column-theme",
    target_element: "div[class*=col-]",
    option_type: 'display-checkbox',
    option: [{
        name: "Transparent",
        class: "bg-transparent"
    }, {
        name: "Grey",
        class: "bg-light-grey border-grey border-solid border-xs text-dark-grey rounded-md"
    }]
});

// column theme
emble.rce.customiseManager.addCustomiseItem({
    label: "Theme",
    id: "studios-theme",
    target_element: "[data-context-menu]",
    option_type: 'display-checkbox',
    option: [{
        name: "RMIT",
        class: "rmit"
    }, {
        name: "Em Dash",
        class: "emdash"
    }, {
        name: "Spicy",
        class: "spicy"
    }, {
        name: "Hipster",
        class: "hipster"
    }, {
        name: "Tramlines",
        class: "tramlines"
    }]
});


/*
Create Menu Dialog
Purpose/Description:
Creates the customise menu dialog when users click on the context menu
Author(s):
Edwin Ang, RMIT Online
Contributor(s):
*/
//emble.rce.contextMenuManager.displayCustomiseMenu = function(uuid, context_menu_el, customise_parameter){

emble.rce.customiseManager.displayCustomiseMenu = function(context_menu_el) {

    // get element UUID
    var uuid = $(context_menu_el).attr('id');

    // allow element to be editable
    $(context_menu_el).attr('contenteditable', true);

    // get customise group in array
    if ($(context_menu_el).attr('data-customise')) {
        var customise_group = $(context_menu_el).attr('data-customise').split(' ');
        var customise_parameter = [];

        // loop specified customise group and generate obj
        for (var i = 0; i < customise_group.length; i++) {

            // loop database customise group
            var customise_group_database = emble.rce.customiseManager.customiseItem;
            loop_database_customise_option:
                for (var k = 0; k < customise_group_database.length; k++) {

                    // if specified customise group exist in database
                    if (customise_group[i] == customise_group_database[k].id) {
                        var customise_group_option = JSON.parse(JSON.stringify(customise_group_database[k]));

                        if ($(context_menu_el).attr('data-' + customise_group[i])) {
                            var custom_option_arr = $(context_menu_el).attr('data-' + customise_group[i]).split(' ');
                            customise_group_option.custom_option = [];
                            for (var x = 0; x < custom_option_arr.length; x++) {

                                var options = customise_group_database[k].option;

                                loop_options:
                                    for (var y = 0; y < options.length; y++) {
                                        if (custom_option_arr[x] == options[y].class) {
                                            customise_group_option.custom_option.push({
                                                name: options[y].name,
                                                class: custom_option_arr[x]
                                            });
                                            break loop_options;
                                        } else if (y == options.length - 1) {
                                            customise_group_option.custom_option.push({
                                                class: custom_option_arr[x]
                                            });
                                        }
                                    }

                            }

                        }
                        customise_parameter.push(customise_group_option);
                        break loop_database_customise_option;
                    }
                    // if this is a custom option, create new parameter
                    else if (customise_group[i] != customise_group_database[k].id && k == customise_group_database.length - 1) {
                        if ($(context_menu_el).attr('data-' + customise_group[i]) || $(context_menu_el).attr('data-' + customise_group[i] + '-type')) {
                            var option_type;
                            if ($(context_menu_el).attr('data-' + customise_group[i] + '-type')) {
                                option_type = 'display-' + $(context_menu_el).attr('data-' + customise_group[i] + '-type');
                            }
                            var label_pre = customise_group[i].replace(/-/g, ' ');
                            var new_group_option = {
                                label: label_pre.charAt(0).toUpperCase() + label_pre.slice(1),
                                id: customise_group[i],
                                target_element: '#' + uuid + '[data-context-menu]',
                                option_type: option_type,
                                custom_option: []
                            };

                            //Code changes to embed h5p in the modal container

                            if (!$(context_menu_el).attr('data-' + customise_group[i] + '-type')) {
                                var custom_option_arr = $(context_menu_el).attr('data-' + customise_group[i]).split(' ');
                                for (var x = 0; x < custom_option_arr.length; x++) {
                                    new_group_option.custom_option.push({
                                        class: custom_option_arr[x]
                                    });
                                }
                            }
                            customise_parameter.push(new_group_option);
                        }
                    }
                }

        }








        var dialog_body = emble.rce.customiseManager.createCustomiseItem(context_menu_el, customise_parameter);



        var action_fn = function(uuid) {
            var editor = emble.rce.activeEditor;
            $(editor.dom.select('#' + uuid + '[data-context-menu]')).replaceWith($('.preview-container').html());
            if ($(editor.dom.select('#' + uuid + '[data-context-menu]')).hasClass('general-notes')) {
                $('#title').val($('#title').val() + '- GENERAL NOTE');

            } else if ($(editor.dom.select('#' + uuid + '[data-context-menu]')).hasClass('multimedia-notes')) {
                $('#title').val($('#title').val() + '- MULTIMEDIA NOTE');
            }
            emble.rce.contextMenuManager.destroyContextMenu();
        };


        // TODO: Add element name to customise menu title
        emble.ui.displayDialog('Customise', dialog_body, 'Update', action_fn, uuid);
        //        emble.ui.displayDialog('Customise '+$(context_menu_el).attr('data-block-name'), dialog_body, 'Update',action_fn, uuid);

        emble.rce.customiseManager.handleCustomise();
    }
}

emble.rce.customiseManager.handleCustomise = function() {
    $('.customise-option-container .display-checkbox-option').off('click');
    $('.customise-option-container .display-checkbox-option').on('click', function() {
        var option_group = $(this).attr('data-option-group');
        var option = $(this).attr('data-option');
        var target = $(this).attr('data-target');

        // update checkbox indicator
        $('.display-checkbox-option[data-option-group="' + option_group + '"]').removeClass('selected');
        $(this).addClass('selected');

        // add class to target
        $('.preview-container ' + target).addClass(option);

        // remove other class from target element
        $('.display-checkbox-option[data-option-group="' + option_group + '"]').each(function() {
            var remove_option = $(this).attr('data-option').split(' ');
            for (var i = 0; i < remove_option.length; i++) {

                var class_regex = new RegExp(remove_option[i], 'gi');
                if (!option.match(class_regex)) {
                    $('.preview-container ' + target).removeClass(remove_option[i]);
                }
            }
        });

        //        // remove unwanted class from target
        //        $('.display-checkbox-option[data-option-group="'+option_group+'"]').each(function(){
        //            var remove_option = $(this).attr('data-option');
        //            if(remove_option != option){
        //                $('.preview-container '+target).removeClass(remove_option);
        //            }
        //        });
    });


    // store default column data
    var default_col_content = [];
    if ($('.preview-container div[class*=col-]').length) {
        $('.preview-container div[class*=col-]').each(function() {
            default_col_content.push($(this).html());
        });
    }


    $('.customise-option-container select').off('change');
    $('.customise-option-container select').on('change', function() {
        var option_group = $(this).attr('data-option-group');
        var option = $(this).val();
        var target = $(this).attr('data-target');

        //console.log ('selected option: ' +option);
        // handle column
        if (option_group == 'column-number') {

            var column_html = '<div class="' + $('.preview-container ' + target).first().attr('class') + '" data-edit-indicator="false"><p>Column</p></div>';

            var current_total = $('.preview-container ' + target).length;
            var selected_number, state;

            if (option == 'col-md-12 col-lg-12') {
                selected_number = 1;
            } else if (option == 'col-md-6 col-lg-6') {
                selected_number = 2;
            } else if (option == 'col-md-4 col-lg-4') {
                selected_number = 3;
            } else if (option == 'col-md-3 col-lg-3') {
                selected_number = 4;
            }

            if (selected_number > current_total) {
                var diff = selected_number - current_total;
                for (var i = 0; i < diff; i++) {
                    //console.log('add column');
                    $('.preview-container ' + target).parent().append(column_html);
                }
            } else if (current_total > selected_number) {
                var diff = current_total - selected_number;
                for (var i = 0; i < diff; i++) {
                    //console.log('remove column');
                    $('.preview-container ' + target).last().remove();
                }
            }

            $('.preview-container ' + target).each(function(i) {
                if (default_col_content[i]) {
                    $(this).html(default_col_content[i]);
                }
            });
        }









        $('.preview-container ' + target).addClass(option);

        // remove other class from target element
        $('.customise-option-container select[data-option-group="' + option_group + '"] option').each(function() {
            var remove_option = $(this).attr('value').split(' ');
            for (var i = 0; i < remove_option.length; i++) {

                var class_regex = new RegExp(remove_option[i], 'gi');
                if (!option.match(class_regex)) {
                    $('.preview-container ' + target).removeClass(remove_option[i]);
                }
            }
        });
    });

    // prevent default link behaviour (redirect)
    if ($('.preview-container a').length) {
        $('.preview-container a').on('click', function(e) {
            e.preventDefault();
        });
    }
    //Code changes to embed h5p in the modal container
    $('.customise-option-container textarea').off('change keyup paste');
    $('.customise-option-container textarea').on('change keyup paste', function() {
        $(".empty-embed").remove();
        if ($(this).val() == '') {
            var empty_embed = '<p class="empty-embed" style="text-align: center;">Embed <a href="https://h5p.org/">H5P</a> iframe here</p>';
            $(".embed-container").html(empty_embed + $(".embed-container").html());
            $('.embed-code').html('');
        } else {
            $(".embed-code").html($(this).val());
        }
    });
}
emble.rce.deleteManager.preventDelete = function(e) {
    var editor = emble.rce.activeEditor;
    var current_el = editor.selection.getNode();
    var parent_el = editor.dom.getParents(current_el, '[data-deletable]');
    var deletable_el;

    if ($(current_el).attr('data-deletable')) {
        deletable_el = current_el;
    } else if ($(parent_el).attr('data-deletable')) {
        deletable_el = parent_el;
    }

    if ($(deletable_el).attr('data-deletable') && $(deletable_el).attr('data-deletable') == 'false' && $(deletable_el).text() == '') {
        $(deletable_el).addClass('highlight-warning-indicator');
        setTimeout(function() {
            $(deletable_el).removeClass('highlight-warning-indicator');

            if ($(deletable_el)[0].classList.length == 0) {
                $(deletable_el).removeAttr('class');
            }
        }, 500);

        // Validation on List items
        // If there are <li> tags in the body, it should still be deletable
        if (deletable_el.tagName == 'LI') {
            if (deletable_el.parentElement.textContent == '') {
                deletable_el.parentElement.remove()
            } else {
                return true;
            }
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }
}
emble.rce.deleteManager.setDeletable = function() {
    var editor = emble.rce.activeEditor;
    var body = editor.getBody();

    // remove data-deletable from p
    $(body).children('p').removeAttr('data-deletable');

    // set last empty p as not deletable
    var lastEl = $(body).children().last();
    //    var lastPrevEl = $(body).children().last().prev();
    if (lastEl.is('p')) {
        lastEl.attr('data-deletable', false);
    }


}




emble.rce.openArc = function() {
    // open rce external tools menu options
    $('.mce-btn[aria-label="More external tools"]').click();

    // open arc
    $('img[data-tool-id="38"]').click();
}
emble.rce.openImg = function() {
    // open rce external tools menu options
    $('.mce-widget.mce-btn[aria-label*="Image"] button[id^=mceu] .mce-i-image').click()
}
emble.rce.openLink = function() {
    $('.mce-widget.mce-btn[aria-label*="Link to URL"] button[id^=mceu]').click();
}
emble.rce.openYoutube = function() {
    $('.mce-widget.mce-btn.mce-instructure_external_tool_button[aria-label*="YouTube"] button[id^=mceu]').click();
}
emble.rce.undoManager.displayBtn = function() {
    // display button
    $('.mce-top-part.mce-container').after('<button class="rce-undo"><i class="icon-reply"></i> Undo</button><button class="rce-redo"><i class="icon-forward"></i> Redo</button>');

    emble.rce.undoManager.updateBtnState();

    // undo click
    $('button.rce-undo').on('click', function(e) {
        e.preventDefault();
        emble.rce.undoManager.undo();
    });

    // redo click
    $('button.rce-redo').on('click', function(e) {
        e.preventDefault();
        emble.rce.undoManager.redo();
    });
}
emble.rce.undoManager.redo = function() {
    emble.rce.activeEditor.undoManager.redo();
    emble.rce.undoManager.updateBtnState();
}
emble.rce.undoManager.undo = function() {
    emble.rce.activeEditor.undoManager.undo();
    emble.rce.undoManager.updateBtnState();
}
emble.rce.undoManager.updateBtnState = function() {
    // disable button according to undo redo state
    var editor = emble.rce.activeEditor;
    if (editor.undoManager.hasUndo()) {
        $('button.rce-undo').removeClass('disabled');
    } else {
        $('button.rce-undo').addClass('disabled');
    }

    if (editor.undoManager.hasRedo()) {
        $('button.rce-redo').removeClass('disabled');
    } else {
        $('button.rce-redo').addClass('disabled');
    }
}
/*
Initialise Emble

Purpose/Description: 
Initialise Emble when editing Canvas page, quiz, assignment, discussion or syllabus.

Author(s):
Edwin Ang, RMIT Online

Contributor(s):
*/
// script to init emble
var newPerson = true;

function initEmble() {
    // get user emble setting
    emble.canvas_api.getEmbleSetting().then(function(data) {
        // user has emble setting
        emble.ui.setting = data;
        newPerson = false;
        // console.log('-----------' + JSON.stringify(data))
        return;
    }, function(err) {

        // user do not have emble setting
        // RUN WELCOME

        emble.canvas_api.putEmbleSetting(emble.ui.setting).then(function(data) {
            //console.log('New emble setting');
            return;

        });
    }).then(function() {

        // get help instructions
        var help_page = emble.database.help_pages;
        for (var i = 0; i < help_page.length; i++) {
            var item_api_url = 'https://rmit.instructure.com/api/v1/courses/' + emble.database.course_id + '/pages/' + help_page[i] + '';

            console.log('item_api_url' + item_api_url)

            emble.canvas_api.getItemData(item_api_url).then(function(data) {
                if (data) {
                    emble.database.help_instruction.push({
                        page_id: data.url,
                        html: data.body
                    })
                }
            });
        }

        // display emble interface shell
        emble.ui.displayInterface().then(function(completed) {
            // enable link to toggle between assemble interface and course menu
            emble.ui.toggleEmbleInterfaceMenu();
            // display help information
            emble.ui.handleHelpBtn();

            // enable block search 
            $('#emble-interface').on('keyup', '#searchFunction', function(e) {
                e.preventDefault();
                emble.ui.blockSearch(this.value.trim()).then(function(complete) {
                    if (complete) {
                        emble.ui.displayBlockOptions(emble.database.filtered_block_category);
                    }
                });
            });

        });


    });

    // get block database
    emble.database.getBlocks(emble.database.course_id).then(function(completed) {
        if (completed) {


            // display block options obtained from database
            emble.ui.displayBlockOptions(emble.database.block_category).then(function(completed) {
                if (completed) {
                    // ability toggle block category
                    emble.ui.toggleBlockCategory();

                    // ability to select block options
                    emble.ui.selectBlockOption();
                }
            });
        }
    });


    // search and wait for tinymce editor to load
    emble.rce.getActiveEditor().then(function(completed) {
        if (completed) {
            var editor = emble.rce.activeEditor;

            emble.rce.undoManager.displayBtn();

            if (newPerson) {
                emble.ui.showWelcome("Welcome to Emble");
            }

            $(emble.rce.activeEditor.iframeElement).css({
                'min-height': '450px'
            });

            // quick fix for contenteditable content
            // ISSUE: unable to type the character , < / ?
            // FIX: remove keydown event on document
            $(document).off('keydown');

            // add RMIT and CB css to editor
            emble.rce.insertCSStoRCE().then(function(complete) {
                // add events to rce 
                emble.rce.editorEvent();
                // add indicator when hovering over element with context menu
                emble.rce.hoverIndicator();
            });
        } else {
            //console.log('No active rich content editor');
        }
    });
}


// quiz - new, edit
// discussion - new, edit
// assignemnt - new, edit
// pages - edit
if (window.location.pathname.match(/(quizzes)\/[0-9]{1,}\/(edit)$/gi) || window.location.pathname.match(/(quizzes)\/[0-9]{1,}\/(new)$/gi) || window.location.pathname.match(/(discussion_topics)\/(new)$/gi) || window.location.pathname.match(/(discussion_topics)\/[0-9]{1,}\/(edit)$/gi) || window.location.pathname.match(/(assignments)\/(new)$/gi) || window.location.pathname.match(/(assignments)\/[0-9]{1,}\/(edit)$/gi) || window.location.pathname.match(/(pages)\/.{1,}\/(edit)$/gi)) {
    initEmble();
}

// pages - new
else if (window.location.pathname.match(/(pages)\/?$/gi)) {
    // init emble when users create a new page
    $('a.new_page').live('click', function() {
        //console.log('click new page');
        initEmble();
    });
}
// syllabus - edit
else if (window.location.pathname.match(/(syllabus)\/?$/gi)) {
    // init emble when users edit the syllabus page
    $('a.edit_syllabus_link').live('click', function() {
        //console.log('click edit syllabus');
        initEmble();
    });
}