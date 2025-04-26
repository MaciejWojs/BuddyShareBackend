const host = process.env.STREAM_HOST_VIDEO || "http://localhost";
/**
 * Transformuje dane z nginx-rtmp na uproszczony format z linkami do streamów
 */
export const transformStreamsData = (data: any) => {
    const result: any = { streams: [] };

    // Sprawdzenie, czy mamy dane w oczekiwanym formacie
    if (!data['http-flv'] || !data['http-flv'].servers) {
        return result;
    }

    // Przejdźmy przez wszystkie serwery i aplikacje
    console.log(data['http-flv'].servers[0].applications[1].live['streams']);
    for (const live of data['http-flv'].servers[0].applications[1].live['streams']) {
        const liveName = live.name;
        const streamInfo = {
            name: live.name,
            qualities: [
                {
                    name: "source",
                    dash: `${host}/dash/${liveName}.mpd`
                },
                {
                    name: "720p",
                    dash: `${host}/dash/test/${liveName}_720p.mpd`
                },
                {
                    name: "480p",
                    dash: `${host}/dash/test/${liveName}_480p.mpd`
                },
                {
                    name: "360p",
                    dash: `${host}/dash/test/${liveName}_360p.mpd`
                }
            ],
            // clients: stream.nclients || 0
        };
        result.streams.push(streamInfo);
    }

    return result;
};
