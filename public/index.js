const k = 1000;
const dataBaseSimulatuion = (THREADS, RPS, SEED, SIMTIME) => {
    const sim = new Sim();

    const table = document.querySelector('.root');

    sim.setLogger((str) => {
        table.innerHTML += `<div>${str}</div>`;
    });

    const random = new Random(SEED);

    const requests = {
        GET: {
            name: 'GET',
            event: new Sim.Event('GET'),
            get duration() {
                const time = 0.5 * Math.random();
                return time * k;
            }
        },
        POST: {
            name: 'POST',
            event: new Sim.Event('POST'),
            get duration() {
                const time = 0.8 * Math.random();
                return time * k;
            }
        },
        UPDATE: {
            name: 'UPDATE',
            event: new Sim.Event('UPDATE'),
            get duration() {
                const time = 1.5 * Math.random();
                return time * k;
            }
        },
        DELETE: {
            name: 'DELETE',
            event: new Sim.Event('DELETE'),
            get duration() {
                const time = 2 * Math.random();
                return time * k;
            }
        },
        get next() {
            const index = Math.floor(Math.random() * 4);
            const name = Object.keys(this)[index];

            const { event, duration } = this[name];
            return { event, duration, name };
        }
    };


    const stats = new Sim.Population("Waiting at Intersection");

    const TrafficController = {
        start: function () {
            const firstEvent = requests.next;
            this.generateTraffic(requests.POST);
            // this.generateTraffic(requests.UPDATE);
            // this.generateTraffic(requests.DELETE);
            // this.generateTraffic(requests.GET);
            firstEvent.event.fire();
        },
        generateTraffic: function (request) {
            stats.enter(this.time());
            // sim.log(request.name);

            this.queueEvent(request.event).done( function () {
                const arrivedAt = this.callbackData;
                // STATS: record that vehicle has left the intersection

                stats.leave(arrivedAt, this.time());
                sim.log(request.name + " (arrived at " + (arrivedAt).toFixed(6) + ")");
            }).setData(this.time());

            console.log(request.duration);
            this.setTimer(request.duration).done(request.event.fire, request.event);

            const { next } = requests;

            const nextArrivalAt = 1000 / RPS + (Math.random() - 0.5) * (0.25 * 1000 / RPS);
            this.setTimer(nextArrivalAt).done(this.generateTraffic, this, [next]);
        }
    };

    sim.addEntity(TrafficController);

    sim.simulate(SIMTIME);

    return [stats.durationSeries.average(),
        stats.durationSeries.deviation()
    ];

};

const start = () => {
    const root = document.querySelector('.root');

    const res = dataBaseSimulatuion(3, 10, 1234, 100_000);
    root.insertAdjacentText('afterend', res.join('________'));
    root.insertAdjacentText('afterend', ['Ср. продолжительность', 'Ср. отклонение'].join('___'));
};

