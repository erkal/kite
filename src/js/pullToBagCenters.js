function pullToBagCenters() {
    var nodes;

    function force(alpha) {
        for (var i = 0, n = nodes.length, node; i < n; ++i) {
            node = nodes[i];
            for (var j = 0, l = node.pullCenters.length, p, xk, yk; j < l; ++j) {
                p = node.pullCenters[j];
                xk = alpha * p.pullXStrength;
                yk = alpha * p.pullYStrength;
                node.vx += (p.pullX - node.x) * xk;
                node.vy += (p.pullY - node.y) * yk;
            };
        };
    };

    function initialize() {
        if (!nodes) return;
    };

    force.initialize = function(_) {
        nodes = _;
        initialize();
    };

    return force;
}