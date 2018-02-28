'use strcit';

import angular from 'angular';

import animateNumberModule from './animate-number'
import loopBannerModule from './loop-banner/loop.banner.common.component'
import commonTextEditorModule from './text-editor/text.editor.common.component'

export default angular
    .module('components.common.module', [animateNumberModule, loopBannerModule, commonTextEditorModule])
    .name;