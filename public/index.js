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

    // const stats = {
    //     GET: new Sim.Population("GET"),
    //     POST: new Sim.Population("POST"),
    //     UPDATE: new Sim.Population("UPDATE"),
    //     DELETE: new Sim.Population("DELETE"),
    // };

    const state = new Sim.Population("ppp");

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
            state.enter(this.time());
            // sim.log(request.name);

            this.queueEvent(request.event).done( function () {
                const arrivedAt = this.callbackData;
                // STATS: record that vehicle has left the intersection

                state.leave(arrivedAt, this.time());
                sim.log(request.name + " (arrived at " + (arrivedAt).toFixed(6) + ")");
            }).setData(this.time());

            this.setTimer(request.duration).done(request.event.fire, request.event);

            const { next } = requests;

            const nextArrivalAt = 1000 / RPS + (Math.random() - 0.5) * (0.25 * 1000 / RPS);
            this.setTimer(nextArrivalAt).done(this.generateTraffic, this, [next]);
        }
    };

    sim.addEntity(TrafficController);

    sim.simulate(SIMTIME);

    // return {
    //     GET: [stats['GET'].durationSeries.average(), stats['GET'].durationSeries.deviation()],
    //     POST: [stats['POST'].durationSeries.average(), stats['POST'].durationSeries.deviation()],
    //     UPDATE: [stats['UPDATE'].durationSeries.average(), stats['UPDATE'].durationSeries.deviation()],
    //     DELETE: [stats['DELETE'].durationSeries.average(), stats['DELETE'].durationSeries.deviation()],
    // };

    return [
        state.sizeSeries.average(),
        state.durationSeries.average()
    ];

};

const start = () => {
    const root = document.querySelector('.root');

    const res = dataBaseSimulatuion(3, 100, 1234, 4_000);
    // Object.values(res).forEach(key => {
    //     root.insertAdjacentText('afterend', res[key].join('________'));
    //     root.insertAdjacentHTML('afterend', [key, 'Ср. продолжительность', 'Ср. отклонение'].join('___') + '<br>');
    // })
    console.log(res);
    root.insertAdjacentText('afterend', res.join('________'));
    root.insertAdjacentHTML('afterend', ['Ср. продолжительность', 'Суммарное время запросов'].join('___') + '<br>');
};

