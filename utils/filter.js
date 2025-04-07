import { LeaderBoard } from '../scanner.js';

const filterLB = (type, options) => {
    const nameType = type === 'name';
    const filterCondition = (lbIndex) => nameType
        ? lbIndex[type].toLowerCase().includes(options.toLowerCase())
        : lbIndex[type] >= parseInt(options);

    const filteredLB = Array.from(LeaderBoard.values()).flatMap(server =>
        server.lb.filter(filterCondition)
            .map(lbIndex => ({
                ...lbIndex,
                serverId: server.id,
                isFull: server.isFull,
                population: server.pop
            }))
    );

    const sortKey = nameType ? 'wave' : type;
    return filteredLB.sort((a, b) => b[sortKey] - a[sortKey]);
};

export { filterLB };