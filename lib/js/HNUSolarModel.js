/*-------------------------------------------------------------------------
 * HNUSolarModel.js
 * Calculate solar heat gain of an indoor human body and convert it into Delta MRT
 *-------------------------------------------------------------------------*/

function HNUSolar(Position, Width, Height, Bottom, Tsol, Rfloor, dh, Distance, bodydirection, clothingAbsorptivity, diffuseRad, directnormalRad, alt, azi) {
    // User-defined inputs:
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

    // Weather inputs from the epw file:
    // var diffuseRad: horizontal diffuse radiation;
    // var directnormalRad: direct normal radiation;
    // var alt = sun altitude;
    // var azi = sun azimuth;

    // Calculated results
    var DeltaMRTdir;
    var DeltaMRTdiff;
    var DeltaMRTrefl;
    var DeltaMRT;
    // intermediate
    var Edir;
    var Ediff;
    var Erefl;
    // body center of a seated person
    var hr = 1.32 / 2;


    if (alt <= 0) {
        Edir = 0;
        Ediff = 0;
        Erefl = 0;
    } else {
        // 实际窗中心线与人中心水平位置差异d0
        var d0 = Math.abs(dh);
        // 实际窗中心线与人中心垂直位置差异d1,假设中心线高于人体中心位置
        var d1 = Math.abs(Height / 2 + Bottom - hr);
        // #地面与窗中心垂直位置差异d4
        var d4 = Math.abs(Height / 2 + Bottom);
        // 散射辐射修正-水平方向c1，垂直方向c2
        // 太阳与窗户中心线夹角b
        var b = azi - Position * 90;
        var c1 = Math.atan((dh / Distance)) / (Math.PI / 180) - b;
        // # 地面对天空垂直半角a4
        var a4 = Math.sin(Math.atan((Height / 2 + d4) / Distance)) - Math.sin(Math.atan((d4 - Height / 2) / Distance));
        if (d0 > (Width / 2)) {
            // 人体中心水平天空半角a0
            var a0 = ((Math.atan((Width / 2 + d0) / Distance)) * 180 / Math.PI - (Math.atan((d0 - Width / 2) / Distance)) * 180 / Math.PI) / 2;
        } else {
            var a0 = (((Math.atan((Width / 2 - d0) / Distance)) * 180 / Math.PI + (Math.atan((Width / 2 + d0) / Distance)) * 180 / Math.PI)) / 2;
        }
        if (d1 > (Height / 2)) {
            // 人体中心垂直天空半角a1
            var a1 = Math.sin(Math.atan((Height / 2 + d1) / Distance)) - Math.sin(Math.atan((d1 - Height / 2) / Distance));
            var c2 = Math.atan((Height / 2 + d1) / Distance) * 180 / Math.PI / 2 + Math.atan((d1 - Height / 2) / Distance) * 180 / Math.PI / 2;
        } else {
            var a1 = Math.sin(Math.atan((Height / 2 + d1) / Distance));
            var c2 = Math.atan((Height / 2 + d1) / Distance) * 180 / Math.PI / 2;
        }
        c2 = alt - c2;
        c3 = alt - Math.atan((Height / 2 + d4) / Distance) * 180 / Math.PI / 2 - Math.atan((d4 - Height / 2) / Distance) * 180 / Math.PI / 2;
        if (Math.abs(c1) <= 180) {
            c1 = Math.abs(c1);
        } else {
            c1 = 360 - Math.abs(c1);
        }

        if (c2 < 0) {
            c2 = Math.abs(c2);
        } else {
            c2 = c2;
        }

        if (c3 < 0) {
            c3 = Math.abs(c3);
        } else {
            c3 = c3;
        }

        if (c1 <= 90) {
            // 如果在太阳所在1/4球面
            // 人体修正散射辐射场 diffuseRad2
            var diffuseRad2 = 0.8 * diffuseRad + (4.7 - 0.05 * alt) * diffuseRad * (90 - c1) / 90 * (90 - c2) / 90;
            // 地面修正散射辐射场 diffuseRad3
            var diffuseRad3 = 0.8 * diffuseRad + (4.7 - 0.05 * alt) * diffuseRad * (90 - c1) / 90 * (90 - c3) / 90;
        } else {
            // 如果不在太阳所在1/4球面
            // 人体修正散射辐射场 diffuseRad2
            var diffuseRad2 = 0.8 * diffuseRad;
            // 地面修正散射辐射场 diffuseRad3
            var diffuseRad3 = 0.8 * diffuseRad;
        }
        Ediff = 0.5 * 0.696 * a1 * a0 / 180 * Tsol * diffuseRad2 * (clothingAbsorptivity / 0.95);
        var Erefl_diff = 0.5 * 0.696 * a4 * a0 / 180 * Tsol * diffuseRad3 * (clothingAbsorptivity / 0.95);

        if ((b > -80) & (b < 80)) {
            // 地面反射等效窗高hrefl
            var hrefl = Height / Math.tan(alt * Math.PI / 180) * Math.cos(b * Math.PI / 180);
            // 等效窗水平中心位置centerh（相对于实际窗水平变化）
            var centerh = (Bottom + Height / 2) / Math.tan(alt * Math.PI / 180) * Math.sin(b * Math.PI / 180);
            // 等效窗垂直中心位置centerv（相对于实际窗垂直变化）
            var centerv = (Bottom + Height / 2) / Math.tan(alt * Math.PI / 180) * Math.cos(b * Math.PI / 180);
            // 等效窗中心线与人中心水平位置差异d2
            var d2 = Math.abs(dh - centerh)
            // 等效窗中心线与人中心垂直位置差异d3
            var d3 = Math.abs(centerv - Distance)
            if (d2 > (Width / 2)) {
                // 等效窗天空水平半角a2
                var a2 = ((Math.atan((Width / 2 + d2) / hr)) / (Math.PI / 180) - (Math.atan((d2 - Width / 2) / hr) / (Math.PI / 180))) / 2;
            } else {
                var a2 = ((Math.atan((Width / 2 - d2) / hr)) / (Math.PI / 180) + (Math.atan((d2 + Width / 2) / hr) / (Math.PI / 180))) / 2;
            }
            if (d3 > (hrefl / 2)) {
                // 等效窗天空垂直半角a3
                var a3 = Math.sin((Math.atan((hrefl / 2 + d3) / hr))) - Math.sin((Math.atan((d3 - hrefl / 2) / hr)));
            } else {
                var a3 = Math.sin((Math.atan((hrefl / 2 - d3) / hr))) + Math.sin((Math.atan((d3 + hrefl / 2) / hr)));
            }
            var Erefl0 = 0.5 * 0.696 * a2 * a3 / 180 * Tsol * Rfloor * (clothingAbsorptivity / 0.95) * directnormalRad * (Math.sin(alt * Math.PI / 180));
            Erefl = Erefl_diff * Rfloor + Erefl0;

            var Distance2 = Distance - 0.1;
            var fbes;
            // 判断人体位置是否在窗高线内
            if (Math.abs(dh - Distance2 * Math.tan(b * Math.PI / 180)) < (Width / 2)) {
                // 人体位置在窗高线内
                // 判断人体投影是否在窗宽线内
                if (((Bottom + Height) / Math.tan(alt * Math.PI / 180)) > (Distance2 / Math.cos(b * Math.PI / 180)) && (Distance2 / Math.cos(b * Math.PI / 180)) >= (Bottom / Math.tan(alt * Math.PI / 180))) {
                    // 人体位置在窗宽线内
                    if ((Bottom + Height) / Math.tan(alt * Math.PI / 180) >= (Distance2 / Math.cos(b * Math.PI / 180) + 2 * hr / Math.tan(alt * Math.PI / 180))) {
                        // 人体位置在窗宽线内且人体投影也完全在窗宽线内， fbes=1
                        fbes = 1;
                    } else {
                        // 人体位置在窗宽线内，但投影不完全在窗宽线内，计算人体投影在窗投影部分的比例
                        fbes = ((Bottom + Height) / Math.tan(alt * Math.PI / 180) - Distance2 / Math.cos(b * Math.PI / 180)) / (2 * hr / Math.tan(alt * Math.PI / 180));
                    }
                } else if ((Distance2 / Math.cos(b * Math.PI / 180)) < (Bottom / Math.tan(alt * Math.PI / 180))) {
                    // 人体不在窗宽线内，但在靠窗台区域，需要判断人体投影有多少在窗宽线内
                    if (((Bottom + Height) / Math.tan(alt * Math.PI / 180)) >= (Distance2 / Math.cos(b * Math.PI / 180) + 2 * hr / Math.tan(alt * Math.PI / 180)) && (Distance2 / Math.cos(b * Math.PI / 180) + 2 * hr / Math.tan(alt * Math.PI / 180)) > (Bottom / Math.tan(alt * Math.PI / 180))) {
                        // 如果人体头部投影仍在窗户投影内，计算窗台对人体的遮挡比例
                        fbes = 1 - (Bottom / Math.tan(alt * Math.PI / 180) - Distance2 / Math.cos(b * Math.PI / 180)) / (2 * hr / Math.tan(alt * Math.PI / 180));
                    } else if (((Bottom + Height) / Math.tan(alt * Math.PI / 180)) < (Distance2 / Math.cos(b * Math.PI / 180) + 2 * hr / Math.tan(alt * Math.PI / 180))) {
                        // 人体头部超过投影区，身体部位投影部分在投影区，仅需计算窗高对人体高度的比值
                        fbes = Height / (2 * hr);
                    } else {
                        // 人体头部未达到投影区，fbes = 0
                        fbes = 0;
                    }
                } else {
                    // 人体不在窗宽线内，在远离窗的位置，fbes=0
                    fbes = 0;
                }
            } else {
                // 人体位置不在窗高线内，fbes=0
                fbes = 0;
            }

            // 找fp
            function find_span(arr, x) {
                for (var i = 0; i < arr.length; i++) {
                    if (x <= arr[i + 1] && x >= arr[i]) {
                        return i;
                    }
                }
            }

            function get_fp(alt, bodydirection, azi) {
                if (Math.abs(bodydirection - azi) <= 180) {
                    sharp = Math.abs(bodydirection - azi);
                } else {
                    sharp = 360 - Math.abs(bodydirection - azi);
                }
                var fp;
                var alt_range = [0, 15, 30, 45, 60, 75, 90];
                var sharp_range = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
                var alt_i = find_span(alt_range, alt);
                var sharp_i = find_span(sharp_range, sharp);
                var fp_table = [[0.29, 0.324, 0.305, 0.303, 0.262, 0.224, 0.177],
                [0.292, 0.328, 0.294, 0.288, 0.268, 0.227, 0.177],
                [0.288, 0.332, 0.298, 0.29, 0.264, 0.222, 0.177],
                [0.274, 0.326, 0.294, 0.289, 0.252, 0.214, 0.177],
                [0.254, 0.308, 0.28, 0.276, 0.241, 0.202, 0.177],
                [0.23, 0.282, 0.262, 0.26, 0.233, 0.193, 0.177],
                [0.216, 0.26, 0.248, 0.244, 0.22, 0.186, 0.177],
                [0.234, 0.258, 0.236, 0.227, 0.208, 0.18, 0.177],
                [0.262, 0.26, 0.224, 0.208, 0.196, 0.176, 0.177],
                [0.28, 0.26, 0.21, 0.192, 0.184, 0.17, 0.177],
                [0.298, 0.256, 0.194, 0.174, 0.168, 0.168, 0.177],
                [0.306, 0.25, 0.18, 0.156, 0.156, 0.166, 0.177],
                [0.3, 0.24, 0.168, 0.152, 0.152, 0.164, 0.177]];
                var fp11 = fp_table[sharp_i][alt_i];
                var fp12 = fp_table[sharp_i][alt_i + 1];
                var fp21 = fp_table[sharp_i + 1][alt_i];
                var fp22 = fp_table[sharp_i + 1][alt_i + 1];
                var sharp1 = sharp_range[sharp_i];
                var sharp2 = sharp_range[sharp_i + 1];
                var alt1 = alt_range[alt_i];
                var alt2 = alt_range[alt_i + 1];
                // bilinear interpolation
                fp = fp11 * (sharp2 - sharp) * (alt2 - alt);
                fp += fp21 * (sharp - sharp1) * (alt2 - alt);
                fp += fp12 * (sharp2 - sharp) * (alt - alt1);
                fp += fp22 * (sharp - sharp1) * (alt - alt1);
                fp /= (sharp2 - sharp1) * (alt2 - alt1);
                return fp;
            }

            var fp = get_fp(alt, bodydirection, azi);
            Edir = 0.696 * fbes * fp * directnormalRad * Tsol * (clothingAbsorptivity / 0.95);
        } else {
            Edir = 0;
            Erefl = Erefl_diff * Rfloor;
        }
    }
    DeltaMRTdir = Edir / 6.012 / 0.696;
    DeltaMRTdiff = Ediff / 6.012 / 0.696;
    DeltaMRTrefl = Erefl / 6.012 / 0.696;
    DeltaMRT = DeltaMRTdir + DeltaMRTdiff + DeltaMRTrefl;

    return DeltaMRT;
}

function SunAlt(lat, lon, TimeZone, hour) {
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

    return alt;

}

function SunAzi(lat, lon, TimeZone, hour) {
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

    return azi;

}