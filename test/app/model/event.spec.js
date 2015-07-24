/*eslint-disable*/
var Event = ne.dooray.calendar.Event;
describe('model/event', function() {
    var event;

    beforeEach(function() {
        event = new Event();
    });

    it('creation', function() {
        expect(event.isAllDay).toBe(false);
    });

    describe('init()', function() {
        var oldDate;
        beforeEach(function() {
            oldDate = window.Date;

            spyOn(window, 'Date').and.callFake(function() {
                return new oldDate('2015/05/01 00:00:00');
            });
        });

        it('initialize event with default values when data is not supplied.', function() {
            var expected = {
                title: '',
                isAllDay: false,
                starts: new Date('2015/05/01 00:00:00'),
                ends: new Date('2015/05/01 00:30:00')
            };

            var myObj = {};

            event.init.call(myObj);
        });

        it('initialize event with supplied options.', function() {
            var expected = {
                title: 'Go home',
                isAllDay: false,
                starts: new Date('2015/05/01 00:00:00'),
                ends: new Date('2015/05/02 00:00:00')
            };

            var myObj = {};

            event.init.call(myObj, {
                title: 'Go home',
                isAllDay: false,
                starts: '2015/05/01 18:30:00',
                ends: '2015/05/02 09:30:00'
            });
        });
    });

    describe('equals()', function() {
        var event,
            event2;

        beforeEach(function() {
            event = new Event(),
            event2 = new Event();
        });

        it('return true when event\'s property are same', function() {
            event.title = 'dance';
            event2.title = 'dance';
            event.isAllDay = true;
            event2.isAllDay = true;
            event.starts = new Date('2015/05/01');
            event2.starts = new Date('2015/05/01');
            event.ends = new Date('2015/05/02');
            event2.ends = new Date('2015/05/02');

            expect(event.equals(event2)).toBe(true);
        });

        it('return false when title is not equals.', function() {
            event.title = 'meeting';
            event2.title = 'working';

            expect(event.equals(event2)).toBe(false);
        });

        it('return false when two event has different all day flags.', function() {
            event.title = 'dance';
            event2.title = 'dance';
            event.isAllDay = true;
            event2.isAllDay = false;

            expect(event.equals(event2)).toBe(false);
        });

        it('return false when two event has different starts or ends.', function() {
            event.title = 'dance';
            event2.title = 'dance';
            event.isAllDay = true;
            event2.isAllDay = true;
            event.starts = new Date('2015/05/01');
            event2.starts = new Date('2015/04/01');

            expect(event.equals(event2)).toBe(false);

            event2.starts = new Date('2015/05/01');

            event.ends = new Date('2015/06/01');
            event2.ends = new Date('2015/07/01');

            expect(event.equals(event2)).toBe(false);
        });
    });

    describe('duration()', function() {
        beforeEach(function() {
            event.starts = new Date('2015-09-25T05:00:00+09:00');
            event.ends = new Date('2015-09-26T05:00:00+09:00');
        });

        it('can calculate duration between starts and ends.', function() {
            expect(event.duration()).toEqual(new Date('1970-01-02T00:00:00Z'));
        });

        it('return 24 hours when event is all day event.', function() {
            event.isAllDay = true;
            expect(event.duration()).toEqual(new Date('1970-01-03T08:59:59+09:00'));
        });
    });

    describe('Event.create()', function() {
        it('create event model instance from data object.', function() {
            var mock = {
                title: 'hunting',
                isAllDay: true,
                starts: '2015/05/02',
                ends: '2015/05/02'
            };

            var event = Event.create(mock);

            var compare = new Event();
            compare.title = 'hunting',
            compare.isAllDay = true;
            compare.starts = new Date('2015/05/02');
            compare.ends = new Date('2015/05/02');

            expect(event.equals(compare)).toBe(true);
        });

        it('no error for empty some properties', function() {
            expect(function() {
                Event.create();
            }).not.toThrow();
        });
    });

    describe('collidesWith()', function() {
        /**
         * type - A
         * |---|
         * | A |---|
         * |---| B |
         *     |---|
         *
         * type - B
         *     |---|
         * |---| B |
         * | A |---|
         * |---|
         */
        it('Check type A, B', function() {
            var a = Event.create({
                title: 'A',
                isAllDay: false,
                starts: '2015-05-01T09:30:00+09:00',
                ends: '2015-05-01T10:00:00+09:00'
            });
            var b = Event.create({
                title: 'B',
                isAllDay: false,
                starts: '2015-05-01T09:40:00+09:00',
                ends: '2015-05-01T10:10:00+09:00'
            });

            expect(a.collidesWith(b)).toBe(true);
            expect(b.collidesWith(a)).toBe(true);
        });

        /**
         * type - C
         *
         * |---|
         * |   |---|
         * | A | B |
         * |   |---|
         * |---|
         *
         * type - D
         *     |---|
         * |---|   |
         * | A | B |
         * |---|   |
         *     |---|
         */
        it('check type C, D', function() {
            var a = Event.create({
                title: 'A',
                isAllDay: false,
                starts: '2015-05-01T09:30:00+09:00',
                ends: '2015-05-01T10:00:00+09:00'
            });
            var b = Event.create({
                title: 'B',
                isAllDay: false,
                starts: '2015-05-01T09:00:00+09:00',
                ends: '2015-05-01T10:30:00+09:00'
            });

            expect(a.collidesWith(b)).toBe(true);
            expect(b.collidesWith(a)).toBe(true);
        });

        /**
         * type - E
         * |---|
         * | A |
         * |---|
         *     |---|
         *     | B |
         *     |---|
         *
         * type - F
         *     |---|
         *     | B |
         *     |---|
         * |---|
         * | A |
         * |---|
         */
        it('check type E, F', function() {
            var a = Event.create({
                title: 'A',
                isAllDay: false,
                starts: '2015-05-01T09:30:00+09:00',
                ends: '2015-05-01T10:00:00+09:00'
            });
            var b = Event.create({
                title: 'B',
                isAllDay: false,
                starts: '2015-05-01T10:00:00+09:00',
                ends: '2015-05-01T10:30:00+09:00'
            });

            expect(a.collidesWith(b)).toBe(false);
            expect(b.collidesWith(a)).toBe(false);
        });
        
        /**
         * type - G
         * |---|
         * | A |
         * |---|
         *
         *     |---|
         *     | B |
         *     |---|
         *
         * type - H
         *     |---|
         *     | B |
         *     |---|
         *
         * |---|
         * | A |
         * |---|
         */
        it('check type G, H', function() {
            var a = Event.create({
                title: 'A',
                isAllDay: false,
                starts: '2015-05-01T09:30:00+09:00',
                ends: '2015-05-01T09:50:00+09:00'
            });
            var b = Event.create({
                title: 'B',
                isAllDay: false,
                starts: '2015-05-01T10:10:00+09:00',
                ends: '2015-05-01T10:30:00+09:00'
            });

            expect(a.collidesWith(b)).toBe(false);
            expect(b.collidesWith(a)).toBe(false);
        });
    });
});

