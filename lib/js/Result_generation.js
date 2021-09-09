/*-------------------------------------------------------------------------
 * Result_generation.js
 * Use HNUSolarModel and prepare the data for visulization
 * Mode 1: generate whole-year hourly values
 * Mode 2: generate values of different indoor locations at a certain hour
 *-------------------------------------------------------------------------*/



function Mode1(Position, Width, Height, Bottom, Tsol, Rfloor, dh, Distance, bodydirection, clothingAbsorptivity, epw) {
    // User-defined inputs (fixed single values):
    // var Position: window direction (1, 2, 3, or 4);
    // var Width: window width;
    // var Height: window height;
    // var Bottom: window sill height;
    // var Tsol: window transmittance;
    // var Rfloor: floor reflection ratio;
    // var dh: horizontal deviation of the human body from the window center line;
    // var Distance: distance between the human body and the window;
    // var bodydirection: body direction;
    // var clothingAbsorptivity: clothing absorptivity, =0.67 default;

    // Weather data from the epw file (lists):
    var diffuseRad = epw.diffuseHorizontalRadiation();
    var directnormalRad = epw.directNormalRadiation();
    var TimeZone = epw.Timezone;
    var lat = epw.latitude;
    var lon = epw.longitude;


    var data = [];
    var HourlyDeltaMRT;
    for (var i = 0; i < diffuseRad.length; i++) {
        HourlyDeltaMRT = HNUSolar(Position, Width, Height, Bottom, Tsol, Rfloor, dh, Distance, bodydirection, clothingAbsorptivity, diffuseRad[i], directnormalRad[i], SunAlt(lat, lon, TimeZone, i), SunAzi(lat, lon, TimeZone, i));
        data.push(HourlyDeltaMRT);
    };

    return data;
}

function Mode2(hour, Position, Width, Height, Bottom, Tsol, Rfloor, bodydirection, clothingAbsorptivity, diffuseRad, directnormalRad, alt, azi) {
    // User-defined inputs (fixed single values):
    // var hour: the ith hour of a year;
    // var Position: window direction (1, 2, 3, or 4);
    // var Width: window width;
    // var Height: window height;
    // var Bottom: window sill height;
    // var Tsol: window transmittance;
    // var Rfloor: floor reflection ratio;
    // var bodydirection: body direction;
    // var clothingAbsorptivity: clothing absorptivity, =0.67 default;

    // Weather data from the epw file (lists):
    var diffuseRad = epw.diffuseHorizontalRadiation()[hour];
    var directnormalRad = epw.directNormalRadiation()[hour];
    var TimeZone = epw.Timezone;
    var lat = epw.latitude;
    var lon = epw.longitude;


    var wid_bound = Math.ceil(Width / 2);
    var HourlyDeltaMRT;
    var data = [];
    for (var j = 0.5; j < 4; j = j + 0.5) {
        for (var i = -wid_bound; i <= wid_bound; i = i + 0.5) {
        
            HourlyDeltaMRT = HNUSolar(Position, Width, Height, Bottom, Tsol, Rfloor, i, j, bodydirection, clothingAbsorptivity, diffuseRad, directnormalRad, SunAlt(lat, lon, TimeZone, i), SunAzi(lat, lon, TimeZone, i));
            datum = { "x": i, "y": j, "value": HourlyDeltaMRT };
            data.push(datum);
        }
    };
    return data;
}
