import { useEffect, useRef } from 'react';
import './HallOfDapp.css';

const HallOfDapp = () => {
    const galleryRef = useRef(null);

    useEffect(() => {
        const container = galleryRef.current;
        if (!container) return;

        const imagePool = [
            'https://iad.microlink.io/2KA5u8rm86u-yvu06huD7p8xN7HxfwCLdgoJpsK9YcpWKfMWeuMnCba-9qQ7DlVXcNDbUMV44Qph-XlPWZm2qg.png',
            'https://iad.microlink.io/pzmVElVNX3PRWtJ1DQqmg6ruA0rXh9oQrBr6jhtuKm9LCziBOO6BoUB04xeezbDjjZ_8C-gMSLamALuBoKvJTQ.png',
            'https://iad.microlink.io/5uGX6p9ZyDZjB5cJWp7DlQUMWThoWyrl-l3qJLhnDy-R48PhM9OvQ4xzxPcCqM3gPFCFu_EDwavnDXnMkM_DMQ.png',
            'https://iad.microlink.io/2KA5u8rm86u-yvu06huD7p8xN7HxfwCLdgoJpsK9YcpWKfMWeuMnCba-9qQ7DlVXcNDbUMV44Qph-XlPWZm2qg.png',
            'https://iad.microlink.io/5uGX6p9ZyDZjB5cJWp7DlQUMWThoWyrl-l3qJLhnDy-R48PhM9OvQ4xzxPcCqM3gPFCFu_EDwavnDXnMkM_DMQ.png',
            'https://iad.microlink.io/tL9NLzlpcofvVXxX-Cv7-M_djpakWt2gbCuHc6_Xby1fc2FNJIGu9JKlSkHI1k7rA_LjybuXk_adrxElgS8iog.png',
            'https://iad.microlink.io/o6exeGp2yfhZD6NYwePtEwPZX_ieTV5NrznsbBxti3jQC52npj43-B6juUUJhB4Z9osm8nNv62OzvZHq3pEHBQ.png',
            'https://iad.microlink.io/2ltRIJBTPSlI8hboKvi6xT-ZUeJumYNcKU-zzDufG4poNWyrVhPL_e1IhIX7YXnx-5xAnlInC7DEk9DlCkFOMQ.png',
            'https://iad.microlink.io/xUPbr1bZl6syqlv-gJuRnWljVZRl_9b_wmshElUVzbDHN5SVy0-5mqPJ-BNzQmHI6Qv_mxhgG69bWOEAcRP3ww.png',
            'https://iad.microlink.io/1MfVxWuDeTNXLpybr64CediG9dAtTKHWhNTGINmnF7bzp9wpwWMSbYHR6d2kYnrvKVcLqoa10jrdkHHo6dAZvQ.png',
            'https://iad.microlink.io/GwHz4RM5pQGz21ON-TxzacP6TGa9kZ6EiYpDTAaJk2HnNmvPhUWPrgSP9yvZiiUzkrnobh0zeyCZnAqR4ip8AA.png',
            'https://iad.microlink.io/lGpMTMg2ah0KdOZ8iBoT9mvnMx0NUGrt-d0jFKuaBfOWSwayZj2woXsj_h-hD9hvG3U6Vsn7kWcBBAhTlSBo1g.png',
            'https://iad.microlink.io/ZHvuWSfG6oEbaBClLWWo8xFOt90VnPy3fSp7MUBqShVnMPKv9cVag1BOjwPP8NzuBaJ8B3P_KaiNQxuze44DIQ.png',
            'https://iad.microlink.io/boNvdZBW9m4llp9FJ27P8lVagqly_Cw1fZ4lefVBMSIy-lJEJ4xHnJgxvaRF0saTYcsrJxuP72BtcSAzT8NUOQ.png',
            'https://iad.microlink.io/MptCYzbRtPVAdo1WoeSZgmQCXDut7lJSbbxFwqjqMZO1dT5NrxsMRtYOnR7bBnHxYaiH1Ck32gmp8K7HA136sg.png',
            'https://iad.microlink.io/fIIeKb8idzWh5k6IKEnc4FbaAm4bWSgNRD9vHjZOVbwrSJZnYvKoNuv1WobeJT32LqzulOPHcm62-XZ2bS3PmA.png',
            'https://iad.microlink.io/m0EFAmlgrt1_Yspa2urfuZwO1YijqetEQNL5Wk3Hkhigl_y4oD4XSUsHnrSL_7zPGurJ2g-DKxAdPmXxezjizw.png',
            'https://iad.microlink.io/mFx16dq_9vpJ3xCs4kpe9rvzYU8SIZcLUNqdoccbMVo_SRk7t3VFJYrfVWUmTt1CCPGfhjLYKSLrB745WNqTNA.png',
            'https://iad.microlink.io/_6uTwO2nGMqFeCdQOdorgD4PUrR1FrUxNPNbhE2oIc0H-P0ZLA65ZA2go7EYFSHJxgvq6uQVEEgKvCrC4IQ14w.png',
            'https://iad.microlink.io/zVwWy_Tf8pS31vVfdUcw78VN-R-bzIbEL83SqSBU-SN9KuvsUh-e49nBqcU0TQxLUqTXHSbyvY2OP4cEQAAC-A.png',
            'https://iad.microlink.io/eZ_QUN7XGA7GSX4nt-V75AL6S0sd9eDdey17wC_mNmnzHvVkEVa_IpOGOa0hXdQAZUeB9eJen_XAZ4Pgfp952Q.png',
            'https://iad.microlink.io/ChIf2s1xG0-RI7jGYgoE-Xe9NQDnMroLteINC9mU561_1emLZBQUADvI1zhLSqpwlssm8vDKjcCho-vYyl_2wQ.png',
            'https://iad.microlink.io/LXcQP5EQXsssZ-iF9McnvBzPXhxtGOitwf67XU-mLacUtJJDg1czxpZU6D4G2R8Qa2XKgLXjfXqfU6PndudaVg.png'
        ];

        const pickNewUrl = (currentSrc) => {
            let url = currentSrc;
            let tries = 0;
            while (url === currentSrc && tries < 6) {
                url = imagePool[Math.floor(Math.random() * imagePool.length)];
                tries += 1;
            }
            return url;
        };

        const figures = Array.from(container.querySelectorAll('.tile-gallery__figure'));
        const timeouts = [];

        figures.forEach((figure, idx) => {
            const firstImg = figure.querySelector('img.tile-gallery__image');
            if (!firstImg) return;

            let secondImg = figure.querySelector('img.tile-gallery__image.layer-2');
            if (!secondImg) {
                secondImg = firstImg.cloneNode(true);
                secondImg.classList.add('layer-2');
                figure.appendChild(secondImg);
            }

            // Roles
            firstImg.classList.add('is-current');
            firstImg.classList.remove('off-right', 'slide-in-from-right', 'slide-out-left');
            secondImg.classList.add('off-right');
            secondImg.classList.remove('is-current', 'slide-in-from-right', 'slide-out-left');

            const SLIDE_MS = 900; // must match CSS
            const BASE_DELAY_MS = 7000; // time between completed slides
            const STAGGER_MS = 450 * idx;
            const BETWEEN_CYCLES_MS = BASE_DELAY_MS + STAGGER_MS;

            let inFlight = false;

            const cycle = () => {
                if (inFlight) return; // guard
                inFlight = true;

                const current = figure.querySelector('.tile-gallery__image.is-current');
                const next = figure.querySelector('.tile-gallery__image.off-right');
                if (!current || !next) {
                    inFlight = false;
                    scheduleNext();
                    return;
                }

                const nextUrl = pickNewUrl(current.getAttribute('src'));
                const loader = new Image();
                loader.src = nextUrl;

                const startTransition = () => {
                    next.setAttribute('src', nextUrl);
                    void next.offsetWidth; // ensure initial transform applies

                    current.classList.add('slide-out-left');
                    next.classList.add('slide-in-from-right');

                    // After slide completes, swap roles and schedule next cycle
                    const doneId = setTimeout(() => {
                        current.classList.remove('is-current', 'slide-out-left');
                        current.classList.add('off-right');

                        next.classList.remove('off-right', 'slide-in-from-right');
                        next.classList.add('is-current');

                        inFlight = false;
                        scheduleNext();
                    }, SLIDE_MS);
                    timeouts.push(doneId);
                };

                if (loader.complete) startTransition();
                else {
                    loader.onload = startTransition;
                    loader.onerror = startTransition; // fallback to avoid stalling
                }
            };

            const scheduleNext = () => {
                const id = setTimeout(cycle, BETWEEN_CYCLES_MS);
                timeouts.push(id);
            };

            // start first cycle after initial delay
            scheduleNext();
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <section className="hall-of-dapp">
            <div className="hall-of-dapp-container">
                <h2 className="hall-of-dapp-heading">Hall of Dapp</h2>

                <div className="tile-gallery" ref={galleryRef}>
                    {/* Columns and tiles unchanged */}
                    <div className="tile-gallery__col">
                        <div className="tile-gallery__row">
                            <div className="tile-gallery__tile tile-gallery__tile--big">
                                <div className="tile-gallery__figure">
                                    <img src="https://iad.microlink.io/xzOeaJTeHkgv9CHYB9T94ih-3Ihh70veQDvhFzhZhMnk929RKjDSj2b19SdBc6L2sOpxmr1rqv9zWt_IqYmBBQ.png" alt="DeFi" className="tile-gallery__image" />
                                </div>
                            </div>
                        </div>
                        <div className="tile-gallery__row">
                            <div className="tile-gallery__col">
                                <div className="tile-gallery__row">
                                    <div className="tile-gallery__tile">
                                        <div className="tile-gallery__figure">
                                            <img src="https://iad.microlink.io/MiN3c20hhggK1MC5mgXriqCOGuZbrK3Rszhh-zI9ChjSAyKU6bDcwJE9tHp85LDs7gjwdD1aFdX7QefoVkQuCQ.png" alt="NFT" className="tile-gallery__image" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tile-gallery__col">
                                <div className="tile-gallery__row">
                                    <div className="tile-gallery__tile">
                                        <div className="tile-gallery__figure">
                                            <img src="https://iad.microlink.io/q95hXrAbdSKso-DqjdQggIwl-O8DKOZb4j7gUjL1D-plUhMOP2YgafHcc6EOe0qs0IyRIrSKFCh3Arw6TeHycQ.png" alt="DAO" className="tile-gallery__image" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tile-gallery__row">
                            <div className="tile-gallery__tile tile-gallery__tile--big">
                                <div className="tile-gallery__figure">
                                    <img src="https://iad.microlink.io/xzOeaJTeHkgv9CHYB9T94ih-3Ihh70veQDvhFzhZhMnk929RKjDSj2b19SdBc6L2sOpxmr1rqv9zWt_IqYmBBQ.png" alt="DeFi" className="tile-gallery__image" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tile-gallery__col tile-gallery__col_responsive">
                        <div className='tile-gallery__row_responsive'>
                            <div className="">
                                <div className="tile-gallery__tile tile-gallery__tile--normal">
                                    <div className="tile-gallery__figure">
                                        <img src="https://iad.microlink.io/2zaeYhH4isxG1UX-m3AK62mg0szWxmNvWg7qLuzgkjh4V06j8kHR3sTRSJAJ__YW0HP5V7wakbRHJFcRGrdPSg.png" alt="GameFi" className="tile-gallery__image" />
                                    </div>
                                </div>
                            </div>
                            <div className="">
                                <div className="tile-gallery__tile tile-gallery__tile--normal">
                                    <div className="tile-gallery__figure">
                                        <img src="https://iad.microlink.io/JIDlg-V9swUt426bFJgh70xmXG1Dz5krR39Jexvke_k0TASTesjkUVxr4fxGCu_u-RODFAtZjkA4cQjh93IdiA.png" alt="DEX" className="tile-gallery__image" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='tile-gallery__row_responsive'>
                            <div className="">
                                <div className="tile-gallery__tile tile-gallery__tile--narrow">
                                    <div className="tile-gallery__figure">
                                        <img src="https://iad.microlink.io/frFz6TvyARHQC8V-OMJtoZVaOdt5EXvo9km87ipAUEzvKKQm4WJmlwcLo1IrsR4YA_IjjBAx1VVB8qgl9iOOVQ.png" alt="Lending" className="tile-gallery__image" />
                                    </div>
                                </div>
                            </div>
                            <div className="">
                                <div className="tile-gallery__tile tile-gallery__tile--narrow">
                                    <div className="tile-gallery__figure">
                                        <img src="https://iad.microlink.io/frFz6TvyARHQC8V-OMJtoZVaOdt5EXvo9km87ipAUEzvKKQm4WJmlwcLo1IrsR4YA_IjjBAx1VVB8qgl9iOOVQ.png" alt="Lending" className="tile-gallery__image" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tile-gallery__col">
                        <div className="tile-gallery__row">
                            <div className="tile-gallery__col">
                                <div className="tile-gallery__row">
                                    <div className="tile-gallery__tile">
                                        <div className="tile-gallery__figure">
                                            <img src="https://iad.microlink.io/DR5KmRlEAh_HuOu0VR5QEZlYbg1rLIKmNT5OEp58PxPdUBjB6n6KD3uRpHYF3-G1f9qkKzEv0CW-zc_Oouzv_Q.png" alt="Staking" className="tile-gallery__image" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tile-gallery__col">
                                <div className="tile-gallery__row">
                                    <div className="tile-gallery__tile">
                                        <div className="tile-gallery__figure">
                                            <img src="https://iad.microlink.io/vQ0yO3iSG6l9IEvtHvA91mAXaj0AyhDQwJlFkezOqwG5fWLpvKmCPIegOIQXgs7TPPOibEMQJjyrAnUvphtBJA.png" alt="Bridge" className="tile-gallery__image" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tile-gallery__row">
                            <div className="tile-gallery__tile tile-gallery__tile--big">
                                <div className="tile-gallery__figure">
                                    <img src="https://iad.microlink.io/vQ0yO3iSG6l9IEvtHvA91mAXaj0AyhDQwJlFkezOqwG5fWLpvKmCPIegOIQXgs7TPPOibEMQJjyrAnUvphtBJA.png" alt="Yield" className="tile-gallery__image" />
                                </div>
                            </div>
                        </div>
                        <div className="tile-gallery__row">
                            <div className="tile-gallery__tile tile-gallery__tile--big">
                                <div className="tile-gallery__figure">
                                    <img src="https://iad.microlink.io/vQ0yO3iSG6l9IEvtHvA91mAXaj0AyhDQwJlFkezOqwG5fWLpvKmCPIegOIQXgs7TPPOibEMQJjyrAnUvphtBJA.png" alt="Yield" className="tile-gallery__image" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HallOfDapp;
