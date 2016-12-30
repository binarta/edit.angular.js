describe('bin.edit module', function () {
    beforeEach(module('bin.edit'));

    describe('binEdit component', function () {
        var $ctrl, topics;

        beforeEach(inject(function ($componentController, topicRegistry) {
            topics = topicRegistry;
            $ctrl = $componentController('binEdit');
            $ctrl.$onInit();
        }));

        it('component is in hidden state', function () {
            expect($ctrl.state.name).toEqual('hidden');
        });

        it('register on edit mode event', function () {
            expect(topics.subscribe).toHaveBeenCalledWith('edit.mode', jasmine.any(Function));
        });

        describe('when not in edit mode', function () {
            beforeEach(function () {
                topics.subscribe.calls.mostRecent().args[1](false);
            });

            it('component is in hidden state', function () {
                expect($ctrl.state.name).toEqual('hidden');
            });

            it('on close', function () {
                $ctrl.close();

                expect($ctrl.state.name).toEqual('hidden');
            });
        });

        describe('when in edit mode', function () {
            beforeEach(function () {
                topics.subscribe.calls.mostRecent().args[1](true);
            });

            it('component is in closed state', function () {
                expect($ctrl.state.name).toEqual('closed');
            });

            it('on toggle menu', function () {
                $ctrl.state.toggle();

                expect($ctrl.state.name).toEqual('opened');

                $ctrl.state.toggle();

                expect($ctrl.state.name).toEqual('closed');
            });

            it('on close', function () {
                $ctrl.state.toggle();

                expect($ctrl.state.name).toEqual('opened');

                $ctrl.close();

                expect($ctrl.state.name).toEqual('closed');
            });
        });

        describe('on destroy', function () {
            beforeEach(function () {
                $ctrl.$onDestroy();
            });

            it('edit mode listener is unsubscribed', function () {
                var listener = topics.subscribe.calls.mostRecent().args[1];
                expect(topics.unsubscribe).toHaveBeenCalledWith('edit.mode', listener);
            });
        });
    });
});