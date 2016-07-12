/* global angular */
(function() {
    
    angular
        .module('app', [])
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', '$sce', '$timeout', 'SearchService'];
    function SearchController($scope, $sce, $timeout, SearchService) {
        var vm = this;
        var hideTimer = null;
        var searchTimer = null;
        var lastSearch = null;

        // init scope vars
        vm.currentIndex = null;
        vm.searching = false;
        vm.throttle = vm.throttle || 300;
        vm.minLength = vm.minLength || 1;
        vm.searchStr = null;
        vm.showDropdown = false;
        vm.selected = [];
        vm.results = [];
        vm.isSubmitting = false;
        vm.submitInfo = '';
        vm.hideResults = hideResults;
        vm.resetHideResults = resetHideResults;
        vm.hoverRow = hoverRow;
        vm.selectResult = selectResult;
        vm.removeSelected = removeSelected;
        vm.onInputKeyup = onInputKeyup;
        vm.onElementKeyup = onElementKeyup;
        vm.submit = submit;
        
        function hideResults() {
            hideTimer = $timeout(function() {
                vm.showDropdown = false;
            }, vm.throttle);
        }

        function resetHideResults() {
            if(hideTimer) {
                $timeout.cancel(hideTimer);
            }
        }

        function hoverRow(index) {
            vm.currentIndex = index;
        }
    
        function selectResult(result) {
            if (vm.matchClass) {
                result.value = result.value.toString().replace(/(<([^>]+)>)/ig, '');
            }
            // clearing the search string may not be necessary
            vm.searchStr = '';
            lastSearch = result.value;
            // check if already selected
            var found = vm.selected.some(function(el) {
                return el.value === result.value;
            });
            if (!found) {
                vm.selected.push(result);
            }
            vm.showDropdown = false;
            vm.submitInfo = '';
            vm.results = [];
        }

        function processResults(data, str) {
            if (data && data.length) {
                vm.results = [];
                data.forEach(function(item) {
                    // Get the values
                    var displayValue = item[vm.displayField];
                    var id = item[vm.idField];
                    
                    if (vm.matchClass) {
                        var re = new RegExp(str, 'i');
                        var strPart = displayValue.match(re)[0];
                        displayValue = $sce.trustAsHtml(displayValue.replace(
                            re, 
                            '<span class="'+ vm.matchClass +'">'+ strPart +'</span>')
                        );
                    }

                    vm.results.push({
                        value: displayValue,
                        id: id
                    });
                });

            } else {
                vm.results = [];
            }
        }
        
        function findMatches(data, searchField, str) {
            return data.reduce(function(res, item) {
                var match = false
                || (item[searchField]
                && item[searchField].toLowerCase().indexOf(str.toLowerCase()) === 0);
                    
                return match ? res.concat(item) : res;
            }, []);
        }        
        
        function doSearch(str) {

            if (str.length >= vm.minLength) {
                // locally supplied data takes precedence over http
                if (vm.localData) {
                    var matches = findMatches(
                        SearchService.getLocalData(vm.localData), 
                        vm.searchField, 
                        str);
                    vm.searching = false;
                    processResults(matches, str);

                } else {
                    SearchService
                        .getRemoteData(vm.url + str)
                        .then(function(response) {
                            vm.searching = false;
                            var matches = response.data;
                            processResults(matches, str);
                        },
                        function(response) {
                            var status = response.status;
                            var msg = 'Server error';
                            // status 404 will work just fine
                            vm.searching = false;
                            processResults(null);
                            if (status === 500) {
                                vm.submitInfo = msg;
                            }
                        });
                }
            }
        }
        
        function removeSelected(index) {
            vm.selected.splice(index, 1);
        }
        
        function needsNewSearch(newTerm, oldTerm) {
            return newTerm.length >= vm.minLength && newTerm != oldTerm;
        }

        function onInputKeyup(event) {
            if (!~[38, 40, 13].indexOf(event.which)) {
                if (!vm.searchStr) {
                    vm.showDropdown = false;
                    lastSearch = null;
                } 
                else if (needsNewSearch(vm.searchStr, lastSearch)) {
                    lastSearch = vm.searchStr;
                    vm.showDropdown = true;
                    vm.currentIndex = -1;
                    vm.results = [];
                    vm.searching = true;

                    if (searchTimer) {
                        $timeout.cancel(searchTimer);
                    }

                    searchTimer = $timeout(function() {
                        doSearch(vm.searchStr);
                    }, vm.throttle);
                }
            } 
            else {
                event.preventDefault();
            }
        }
        
        function onElementKeyup(event) {
            // arrow down
            if(event.which === 40) {
                if (vm.results && (vm.currentIndex + 1) < vm.results.length) {
                    vm.currentIndex++;
                    $scope.$apply();
                    event.preventDefault;
                    event.stopPropagation();
                } 
                
            } 
            // arrow up
            else if(event.which === 38) {
                if (vm.currentIndex >= 1) {
                    vm.currentIndex --;
                    $scope.$apply();
                    event.preventDefault;
                    event.stopPropagation();
                }
            }
            // enter
            else if (event.which === 13) {
                if (vm.results && vm.currentIndex >= 0 
                    && vm.currentIndex < vm.results.length) {
                    vm.selectResult(vm.results[vm.currentIndex]);
                } else {
                    vm.results = [];
                }
                event.preventDefault;
                event.stopPropagation();
                $scope.$apply();
            }
            // escape
            else if (event.which === 27) {
                vm.results = [];
                vm.showDropdown = false;
                $scope.$apply();
            }
            // backspace
            else if (event.which === 8) {
                $scope.$apply();
            }
        }        
        
            
        function submit(e) {
            vm.isSubmitting = true;
            vm.submitInfo = 'Sending to server...';
            e.preventDefault();
            var data = vm.selected.reduce(function(res, item) {
                return res.concat(item.id);
            }, []);
            SearchService
                .submitData(vm.submitUrl, {isoCodes: data})
                .then(function(response) {
                    vm.isSubmitting = false;
                    vm.selected = [];
                    vm.submitInfo = 'Successfully submitted.';
                },
                function(reponse) {
                    vm.isSubmitting = false;
                    vm.submitInfo = 'Error: data not submitted.';                        
                });
        }
    }
})();
