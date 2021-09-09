/*-------------------------------------------------------------------------
 * SunPosition.js
 * Calculate sun altitude and azimuth
 *-------------------------------------------------------------------------*/

function SunPosition(lat, lon, TimeZone, hour) {
    // lat: latitude read from epw file
    // lon: longtitude read from epw file
    // Timezone: Time zone number read from epw file
    // hour: The ith hour

    var sin = Math.sin;
    var cos = Math.cos;
    var asin = Math.asin;
    var acos = Math.acos;
    var DegtoRad = Math.PI / 180;
    var RadtoDeg = 180 / Math.PI;
    TimeZone = TimeZone * 15;
    var lat_Rad = lat * DegtoRad;
    var lon_Rad = lon * DegtoRad;
    var n = Math.ceil(hour / 24);
    var chiwei = 23.45 * sin(2 * Math.PI * (284 + n) / 365);
    var chiwei_Rad = chiwei * DegtoRad;
    var b = 2 * Math.PI * (n - 81) / 364;
    var e = 9.87 * sin(2 * b) - 7.53 * cos(b) - 1.5 * sin(b);
    var t_local = hour % 24;
    var t_solar; //真太阳时
    if (lon >= 0) {
        t_solar = t_local + e / 60 + (lon - TimeZone) / 15;
    }
    else {
        t_solar = t_local + e / 60 - (lon - TimeZone) / 15;
    }
    var t = (t_solar - 12) * 15; //太阳时角
    var t_Rad = t * DegtoRad;
    var alt_Rad = asin(sin(lat_Rad) * sin(chiwei_Rad) + cos(lat_Rad) * cos(chiwei_Rad) * cos(t_Rad));
    var azi_Rad = acos((sin(alt_Rad) * sin(lat_Rad) - sin(chiwei_Rad)) / (cos(alt_Rad) * cos(lat_Rad)));
    var alt = alt_Rad * RadtoDeg;
    var azi = azi_Rad * RadtoDeg;
    if (t_solar <= 12) {
        azi = 180 - azi;
    }
    else {
        azi += 180;
    }

    return [alt, azi];

}