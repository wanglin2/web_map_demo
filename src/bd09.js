var MCBAND = [12890594.86, 8362377.87, 5591021, 3481989.83,
    1678043.12, 0
];
var LLBAND = [75, 60, 45, 30, 15, 0];
var MC2LL = [
    [1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2],
    [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877,
        47.40033549296737, -16.50741931063887,
        2.28786674699375, 10260144.86
    ],
    [-3.030883460898826e-8, 0.00000898305509983578,
        0.30071316287616, 59.74293618442277,
        7.357984074871, -25.38371002664745,
        13.45380521110908, -3.29883767235584,
        0.32710905363475, 6856817.37
    ],
    [-1.981981304930552e-8, 0.000008983055099779535,
        0.03278182852591, 40.31678527705744,
        0.65659298677277, -4.44255534477492,
        0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06
    ],
    [3.09191371068437e-9, 0.000008983055096812155,
        0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4
    ],
    [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]
];

var LL2MC = [
    [-0.0015702102444, 111320.7020616939,
        1704480524535203, -10338987376042340,
        26112667856603880, -35149669176653700,
        26595700718403920, -10725012454188240,
        1800819912950474, 82.5
    ],
    [0.0008277824516172526, 111320.7020463578,
        647795574.6671607, -4082003173.641316,
        10774905663.51142, -15171875531.51559,
        12053065338.62167, -5124939663.577472,
        913311935.9512032, 67.5
    ],
    [0.00337398766765, 111320.7020202162,
        4481351.045890365, -23393751.19931662,
        79682215.47186455, -115964993.2797253,
        97236711.15602145, -43661946.33752821,
        8477230.501135234, 52.5
    ],
    [0.00220636496208, 111320.7020209128,
        51751.86112841131, 3796837.749470245,
        992013.7397791013, -1221952.21711287,
        1340652.697009075, -620943.6990984312,
        144416.9293806241, 37.5
    ],
    [-0.0003441963504368392, 111320.7020576856,
        278.2353980772752, 2485758.690035394,
        6070.750963243378, 54821.18345352118,
        9540.606633304236, -2710.55326746645,
        1405.483844121726, 22.5
    ],
    [-0.0003218135878613132, 111320.7020701615,
        0.00369383431289, 823725.6402795718,
        0.46104986909093, 2351.343141331292,
        1.58060784298199, 8.77738589078284,
        0.37238884252424, 7.45
    ]
];

export function lngLatToMercator(T) {
    var c = new cd(T[0], T[1]);
    var r = convertLL2MC(c);
    return [r.lng, r.lat];
}

export function mercatorToLngLat(T) {
    var c = new cd(T[0], T[1]);
    var r = convertMC2LL(c);
    return [r.lng, r.lat];
}

function convertLL2MC(T) {
    var cL, cN;
    T.lng = getLoop(T.lng, -180, 180);
    T.lat = getRange(T.lat, -74, 74);
    cL = new cd(T.lng, T.lat);
    for (var cM = 0; cM < LLBAND.length; cM++) {
        if (cL.lat >= LLBAND[cM]) {
            cN = LL2MC[cM];
            break
        }
    }
    if (!cN) {
        for (var cM = LLBAND.length - 1; cM >= 0; cM--) {
            if (cL.lat <= -LLBAND[cM]) {
                cN = LL2MC[cM];
                break
            }
        }
    }
    var cO = convertor(T, cN);
    var T = new cd(cO.lng.toFixed(2), cO.lat.toFixed(2));
    return T
}

function convertMC2LL(cL) {
    var cM, cO;
    cM = new cd(Math.abs(cL.lng), Math.abs(cL.lat));
    for (var cN = 0; cN < MCBAND.length; cN++) {
        if (cM.lat >= MCBAND[cN]) {
            cO = MC2LL[cN];
            break
        }
    }
    var T = convertor(cL, cO);
    var cL = new cd(T.lng.toFixed(6), T.lat.toFixed(6));
    return cL
}

function getRange(cM, cL, T) {
    if (cL != null) {
        cM = Math.max(cM, cL)
    }
    if (T != null) {
        cM = Math.min(cM, T)
    }
    return cM
}

function getLoop(cM, cL, T) {
    while (cM > T) {
        cM -= T - cL
    }
    while (cM < cL) {
        cM += T - cL
    }
    return cM
}

function convertor(cM, cN) {
    if (!cM || !cN) {
        return
    }
    var T = cN[0] + cN[1] * Math.abs(cM.lng);
    var cL = Math.abs(cM.lat) / cN[9];
    var cO = cN[2] + cN[3] * cL + cN[4] * cL * cL + cN[5] * cL *
        cL * cL + cN[6] * cL * cL * cL * cL + cN[7] * cL *
        cL * cL * cL * cL + cN[8] * cL * cL * cL * cL *
        cL * cL;
    T *= (cM.lng < 0 ? -1 : 1);
    cO *= (cM.lat < 0 ? -1 : 1);
    return new cd(T, cO)
}

function cd(T, cL) {
    if (isNaN(T)) {
        T = bV(T);
        T = isNaN(T) ? 0 : T
    }
    if (b3(T)) {
        T = parseFloat(T)
    }
    if (isNaN(cL)) {
        cL = bV(cL);
        cL = isNaN(cL) ? 0 : cL
    }
    if (b3(cL)) {
        cL = parseFloat(cL)
    }
    this.lng = T;
    this.lat = cL
}
cd.isInRange = function (T) {
    return T && T.lng <= 180 && T.lng >= -180 && T.lat <= 74 &&
        T.lat >= -74
};
cd.prototype.equals = function (T) {
    return T && lat == T.lat && lng == T.lng
};

function bV(cN) {
    var cL = "";
    var cU, cS, cQ = "";
    var cT, cR, cP, cO = "";
    var cM = 0;
    var T = /[^A-Za-z0-9\+\/\=]/g;
    if (!cN || T.exec(cN)) {
        return cN
    }
    cN = cN.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    do {
        cT = cf.indexOf(cN.charAt(cM++));
        cR = cf.indexOf(cN.charAt(cM++));
        cP = cf.indexOf(cN.charAt(cM++));
        cO = cf.indexOf(cN.charAt(cM++));
        cU = (cT << 2) | (cR >> 4);
        cS = ((cR & 15) << 4) | (cP >> 2);
        cQ = ((cP & 3) << 6) | cO;
        cL = cL + String.fromCharCode(cU);
        if (cP != 64) {
            cL = cL + String.fromCharCode(cS)
        }
        if (cO != 64) {
            cL = cL + String.fromCharCode(cQ)
        }
        cU = cS = cQ = "";
        cT = cR = cP = cO = ""
    } while (cM < cN.length);
    return cL
}

function b3(T) {
    return typeof T == "string"
}