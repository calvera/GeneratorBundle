// Custom scripts belonging to Admingenerator
;(function(window, $, undefined){
    //needed to make select2 formtypes function in filter modal
    $.fn.modal.Constructor.prototype.enforceFocus = function() {};
    
    var S2A = window.S2A || {};
    window.S2A = S2A;

    S2A.singleActionsManager = function(options){
        this.options = $.extend({}, {
                containerSelector: 'document',
                buttonSelector: 'a.object-action'
            },
            options
        );
        $(this.options.containerSelector).find(this.options.buttonSelector).each(function(index, object) {
            $(object).data('href', $(object).attr('href'));
            $(object).attr('href', $(object).data('target'));
            }
        );
    };

    S2A.batchActionsManager = function(options){
        this.options = $.extend( {}, {
                containerSelector: 'document',
                actionSelector: 'select[name=action]',
                toggleSelector: 'input[name=batch_select_all]',
                elementSelector: 'input[name="selected[]"]',
                noActionValue: 'none',
                noElementSelectedMessage: 'You have to select at least one element.'
            },
            options
        );

        this.allElementsToggleButton = $(this.options.containerSelector).find(this.options.toggleSelector);
        this.actionInputSelector = $(this.options.containerSelector).find(this.options.actionSelector);
        $(this.options.containerSelector).find('*[type=submit]').hide();

        this.actionInputSelector.on('change', this.selectedActionChangedHandler.bind(this));
        this.allElementsToggleButton.on('ifChecked ifUnchecked', this.allElementsChangedHandler.bind(this));
    };

    S2A.batchActionsManager.prototype = {
        selectedActionChangedHandler: function(evt){
            var $elt = $(evt.currentTarget);
            if (!this.isValidActionSelected($elt.val())) {
                return;
            }

            if (!this.hasElementsSelected()) {
                // TODO: move this to a popin or dynamic message displayer
                alert(this.options.noElementSelectedMessage);
                $elt.val(this.options.noActionValue);
                return;
            }

            if (!this.isConfirmed($elt)) {
                $elt.val(this.options.noActionValue);
                return;
            }

            // TODO: pre-submit trigger
            // Send the form
            $elt[0].form.submit();
        },

        allElementsChangedHandler: function(evt){
            $(this.options.elementSelector)
                .prop('checked', $(evt.currentTarget).is(':checked'))
                .iCheck('update');
        },

        isValidActionSelected: function(actionValue){
            return actionValue != this.options.noActionValue;
        },

        hasElementsSelected: function(){
            return 0 !== $(this.options.containerSelector + ' ' + this.options.elementSelector).filter(':checked').length;
        },

        isConfirmed: function($elt){
            var $selectedOption = $(':selected', $elt);

            if (0 == $selectedOption.length) {
                return false;
            }

            return !$selectedOption.data('confirm') || confirm($selectedOption.data('confirm'));
        }
    };

    S2A.nestedListManager = function(options){
        this.options = $.extend({}, {
                tableSelector: 'table'
            },
            options
        );

        $(this.options.tableSelector).treetable({expendable: true});
    };

    // Force first tab to be displayed
    $('.nav-tabs *[data-toggle="tab"]:first').click();
    
    // Display number of errors on tabs
	$('.nav.nav-tabs li').each(function(i){
        $(this).find('a span.label-danger').remove();
        var invalid_items = $('fieldset'+$(this).find('a:first').data('target')).find('.has-error');
        if (invalid_items.length > 0) {
            $(this).find('a:first').append('<span class="label label-danger">'+invalid_items.length+'</span>');
        }
    });
	
    // Display object actions tooltips
    $('a.object-action').closest('div').tooltip();

    $('#confirmModal').on('show.bs.modal', function (event) {
      var a = $(event.relatedTarget);
      var csrf_token = a.data('csrf-token');
      var action = a.data('href');
      var confirm = a.data('confirm');
      $(this).find('input[name=_csrf_token]').val(csrf_token);
      $(this).find('form').attr('action', action);
      $(this).find('.modal-title').text(confirm);
    })

    // Object actions
    if (S2A.hasOwnProperty('singleActionsAdminOptions')) {
        new S2A.singleActionsManager(S2A.singleActionsAdminOptions);
    }
    // Generic actions
    if (S2A.hasOwnProperty('genericActionsAdminOptions')) {
        new S2A.singleActionsManager(S2A.genericActionsAdminOptions);
    }
    // Batch actions
    if (S2A.hasOwnProperty('batchActionsAdminOptions')) {
        new S2A.batchActionsManager(S2A.batchActionsAdminOptions);
    }
    // Nested list
    if (S2A.hasOwnProperty('nestedTreeAdminOptions')) {
        new S2A.nestedListManager(S2A.nestedTreeAdminOptions);
    }

    $('input').iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass: 'iradio_minimal-blue',
        increaseArea: '20%' // optional
    });

})(window, jQuery);
