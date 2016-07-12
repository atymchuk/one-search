/**
 * Search/autocomplete directive for AngularJS
 */
/* global angular */
(function() {
    angular
        .module('app')
        .directive('oneSearch', oneSearch);

    oneSearch.$inject = [];
    function oneSearch() {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                "id": "@",
                "placeholder": "@",
                "fieldLabel": "@fieldlabel",
                "url": "@url",
                "submitUrl": "@submiturl",
                "searchField": "@searchfield",
                "displayField": "@displayfield",
                "idField": "@idfield",
                "inputClass": "@inputclass",
                "throttle": "@throttle",
                "localData": "@localdata",
                "minLength": "@minlength",
                "matchClass": "@matchclass"
            },
            controller: 'SearchController as vm',
            templateUrl: '/components/search/search.template.html',
            link: link
        };
        
        function link(scope, elem, attrs, ctrl) {
            elem.find('input').on('keyup', ctrl.onInputKeyup);
            elem.on('keyup', ctrl.onElementKeyup);
        }
    }
})();
