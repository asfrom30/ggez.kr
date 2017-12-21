'use strict';

import angular from 'angular';
import './hero.selectors.style.css';
import './hero.selectors.layout.css';

// Memo : JQUEYR get event id `$event.currentTarget.id`;
// Memo2 : 
// $element.find($event.currentTarget).siblings().removeClass('active');
// $element.find($event.currentTarget).addClass('active');

export default angular
    .module('hero.selectors', [])
    .component('heroSelectors', {
        controller : HeroSelectorsCtrl,
        template : require('./hero.selectors.html'),
        bindings : {
            p1GameLabel : '<',
            p2GameLabel : '<',
            
            tierGameLabel : '<',
            
            heroGameLabelP1 : '<',
            heroGameLabelP2 : '<',

            
            firstUserProfile : '<',
            secondUserProfile : '<',
            selected : '=',

            onSelectorChanges : '&',
            changeP2PlayerData : '&',

            storeUserDatas : '&',
            checkUserDatas : '&',
        }
    }).name;

export function HeroSelectorsCtrl($scope, $element, Ajax, CoreUtils){

    var $ctrl = this;

    /* wrap with dom selector */
    const dom = {
        heroSelector : '.hero-selector'
    }

    $ctrl.$onInit = function(){
        const selector = getDefaultSelector();
        onSelectorChanges(selector);
    }

    $ctrl.$onChanges = function(changesObj) {

    }

    $ctrl.compareSearch = compareSearch;
    $ctrl.onPlayerClicked = onPlayerClicked;

    $ctrl.onSelectorClicked = function($event){

        /* View update add active and remove active*/
        let $_targetDom = $event.currentTarget;
        activeJustOne($_targetDom);

        /* update selected */
        updateSelected();
        /* test */
    }

    $ctrl.onHeroClicked = function($event){
        $element.find(dom.heroSelector).removeClass('active');
        $($event.currentTarget).addClass('active');

        updateSelected();
    }


    function onPlayerClicked(id) {
        if(id == undefined) return;
        $ctrl.changeP2PlayerData({$id : id});
    }

    /* View */

    /* Controller */
    function onSelectorChanges(selector) {
        $ctrl.onSelectorChanges({$selector : selector});
    }

    function getDefaultSelector() {
        return {
            p1Index : 'season',
            p2Index : 'season',
            tierIndex : 'heroic',
            heroIndex : 'tracer',
        }
    }

    function activeJustOne($_targetDom) {
        $element.find($_targetDom).siblings().removeClass('active');
        $element.find($_targetDom).addClass('active');
    }

    

    // TODO: 자기버튼먼 업데이트 되게 할 것.
    function updateSelected() {
        let p1ActiveDomId = getActiveDomIdInSiblings("#first-player-selector button");
        let p2ActiveDomId = getActiveDomIdInSiblings("#second-player-selector button");

        $ctrl.selected = {
            p1Index : getDateIndex("first", p1ActiveDomId),
            p2Index : getDateIndex("second", p2ActiveDomId),
            tierIndex : getTierIndex(),
            heroIndex : getHeroSelected(),
        }

        onSelectorChanges($ctrl.selected);//todo : 항상 업데이트 되는게 아니라, 다른 데이터를 선택했을때 변화가 있게 변경할 것..
    }

    function getDateIndex(playerNum, domId){
        let result;
        switch(domId) {
            case playerNum + "-player-week-selected" :
                result = 'week';
                break;
            case playerNum + "-player-yesterday-selected" :
                result = 'yesterday';
                break;
            case playerNum + "-player-today-selected" :
                result = 'today';
                break;
            case playerNum + "-player-season-selected" :
                result = 'season';
                break;
            case playerNum + "-player-custom-selected" :
                result = CoreUtils.getDateIndex(1);
            default :
                result = undefined;
                break;
        }
        return result;
    }


    function getPlayerSelected(playerNum) {
        let result = "";

        $element.find("#" + playerNum + "-player-selector button")
            .siblings()
            .each(function(){
                if($(this).hasClass('active')) {
                    let id = $(this).attr('id');
                    
                }
            });
        return result;
    }

    function getActiveDomIdInSiblings(domSelector){
        let activeId;
        $element.find(domSelector).siblings().each(function(){
            if($(this).hasClass('active')) {
                activeId = $(this).attr('id');
            } 
        })
        return activeId;
    }

    function getTierIndex() {
        let id = undefined;

        $element.find('#tier-selector button')
            .each(function(){
                if($(this).hasClass('active')){
                    id = $(this).attr('id');
                }
            });
        return id;
    }

    function getHeroSelected() {
        let id = undefined;

        $(".hero-selector").each(function(){
            if($(this).hasClass('active')){
                id = $(this).attr('id');
            }
        });

        return id;
    }


    /* not yet used */
    function compareSearch(input) {
        /* Prepare ID() */
        // battle tag or battlen name(id)
        let id = input;

        /* If data is already existed, not request again. */
        if($ctrl.checkUserDatas({$id:id})) {
            console.log(id + " data is already existed");
            return;
        } 

        /* Fetch Data from Server */
        // TODO : update View needed.... IN CALLBACK.
        Ajax.fetchUserDatas(id)
            .then(result => {
                if($ctrl.userDatas === undefined) $ctrl.userDatas = {};
                $ctrl.storeUserDatas({$id : id, $userDatas : result[id]});
            }, reason => {
                console.log('failed');
            });
        
    }
}
