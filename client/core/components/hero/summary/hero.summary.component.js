'use strict';

import angular from 'angular';
import './hero.summary.css';
import numeral from 'numeral';

export default angular.module('hero.summary' ,[])
    .component('heroSummary', {
        template : require('./hero.summary.html'),
        controller : heroSummaryCtrl,
        bindings : {
            currentPlayer : "<",
            currentPlayerDatas : "<"
        },
    })
    .filter('nanFilter', function() {
        return function(input, defaultValue) {
            if(isNaN(input)) return defaultValue;
            else return input;
        }
    })
    .name;

export function heroSummaryCtrl($location, $element, $timeout, $rootScope, $stateParams, Analyzer, Indexer, AppLogger, CoreUtils, LABEL_SUMMARY_PAGE){
    /* @ngInject */

    'ngInject';
    
    var $ctrl = this;
    $ctrl.id = $stateParams.id;

    $ctrl.$onInit = function(){
        /* Init */
        initOnButton();

        /* Label Binding */
        $ctrl.label = LABEL_SUMMARY_PAGE;

        /* Summary Data(Resolve Data Binding) */
        $ctrl.cache = {};
        $ctrl.cache.profile = Analyzer.getSummaryProfile($ctrl.currentPlayerDatas);
        $ctrl.cache.most3 = Analyzer.getSummaryMost3($ctrl.currentPlayerDatas);
        $ctrl.cache.trend = Analyzer.getSummaryTrend($ctrl.currentPlayerDatas);
        
        
        
        $ctrl.dynCache = {};

        if(process.env.NODE_ENV !== 'production') {
            AppLogger.log("== This is $ctrl.label ==");
            AppLogger.log($ctrl.label);
            AppLogger.log("== This is $ctrl.summaryData.profile  ==");
            AppLogger.log($ctrl.cache.profile);
            AppLogger.log("== $ctrl.summaryData.most3 ==");
            AppLogger.log($ctrl.cache.most3);
            AppLogger.log("== $ctrl.summaryData.trend ==");
            AppLogger.log($ctrl.cache.trend);
        }
    }   

    $ctrl.$onChanges = function(changesObj){
        
    } 

    $ctrl.onTrendBtn = onTrendBtn;

    function onTrendBtn($event) {

        if(selectedDate == "") return;

        let selectedDate = "";

        switch($event.currentTarget.id) {
            case 'trend-today-btn' :
                selectedDate = 'today';
                break;
            case 'trend-yesterday-btn' :
                selectedDate = 'yesterday';
                break;
            case 'trend-week-btn' :
                selectedDate = 'week';
                break;
        }
        
        /* View update */
        onTrendBtnUpdate($event)

        /* Data Bind */ 
        onTrendDataBind(selectedDate);
    }

    function onTrendBtnUpdate($event) {
        $element.find("section.trend .btn-group button").removeClass('active');
        $($event.currentTarget).addClass('active');
    }

    function onTrendDataBind(selectedDate) {
        /* diff cptpt in trend label and data bind */
        $ctrl.dynCache.diffCptptLabel = $ctrl.label.trend.diffCptpt[selectedDate];
        $ctrl.dynCache.diffCptpt = $ctrl.cache.trend.diffCptpt[selectedDate];

        /* winrate process bar in trend label and data bind */
        const currentWinRates = $ctrl.cache.trend.winRates.current;
        $ctrl.dynCache.currentProcessBar = getProcessbarData(currentWinRates);
        
        const selectedWinRates = $ctrl.cache.trend.winRates[selectedDate];
        $ctrl.dynCache.selectedProcessBar = getProcessbarData(selectedWinRates);
        return;
    }

    function getProcessbarData(winRates) {
        let success = 0;
        let danger = 0;
        let warning = 0;

        const totalGames = isNaN(winRates.totalGames) ? 0 : winRates.totalGames;
        const winGames = isNaN(winRates.winGames) ? 0 : winRates.winGames;
        const drawGames = isNaN(winRates.drawGames) ? 0 : winRates.drawGames;
        const loseGames = isNaN(winRates.loseGames) ? 0 : winRates.loseGames;
        
        success = numeral(winGames/totalGames).format('0.000');
        danger = numeral(loseGames/totalGames).format('0.000');
        if(drawGames != 0) warning = 1 - success - danger;
        
        return {
            winRates : success * 100,
            success : success,
            danger : danger,
            warning : warning,
        }
    }

    function initOnButton(){
        /* Need time out because of dom loading... */
        $timeout(function(){
            let $targetDom = $element.find('#trend-yesterday-btn');
            $('#trend-yesterday-btn').click();
        })
    }
}

