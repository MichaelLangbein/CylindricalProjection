#%%
import numpy as np
import matplotlib.pyplot as plt

"""
    cylinder 
      radius r
      height h
      point 000 in center of cylinder, on half height
"""



#%%

def length(vec):
    return np.sqrt(np.sum(vec ** 2))


def project(posWorldSpace):
    r = 0.3
    h = 0.6
    dmin = r
    dmax = 100.0

    d = length(posWorldSpace)

    theta = 0.0
    if posWorldSpace[2] > 0.0:
        theta = np.arcsin(posWorldSpace[0] / d)
    else:
        thetaMax = np.pi
        if posWorldSpace[0] < 0.0:
            thetaMax = -np.pi
        theta = thetaMax - np.arcsin(posWorldSpace[0] / d)

    rho = np.arcsin(posWorldSpace[1] / d)

    xNew = theta / np.pi
    yNew = (r * np.tan(rho)) / h
    zNew = (d - dmin) / (dmax - dmin)

    return [xNew, yNew, zNew]



#%% Expecting y to remain at 0
proj = project(np.array([1, 0, 1]))
assert(proj[1] == 0.0)

# Expecting x to be close to one
proj = project(np.array([0.01, 0.0, -1.0]))
assert(proj[0] > 0.99)

# Expecting x to be close to -one
proj = project(np.array([-0.01, 0.0, -1.0]))
assert(proj[0] < -0.99)

#%% creating sample data

# far wall
a = [-2,  2,  4]
b = [ 2,  2,  4]
c = [ 2, -2,  4]
d = [-2, -2,  4]

# near wall
e = [-2,  2, -4]
f = [ 2,  2, -4]
g = [ 2, -2, -4]
h = [-2, -2, -4]

# connecting far wall
ab = np.linspace(a, b, 10)
bc = np.linspace(b, c, 10)
cd = np.linspace(c, d, 10)
da = np.linspace(d, a, 10)

# connecting near wall
ef = np.linspace(e, f, 10)
fg = np.linspace(f, g, 10)
gh = np.linspace(g, h, 10)
he = np.linspace(h, e, 10)

# connecting near wall with far wall
ae = np.linspace(a, e, 10)
bf = np.linspace(b, f, 10)
cg = np.linspace(c, g, 10)
dh = np.linspace(d, h, 10)

samples = np.concatenate((ab, bc, cd, da, ef, fg, gh, he, ae, bf, cg, dh))

# projecting samples
projected = []
for point in samples:
    projected.append(project(point))
projected = np.array(projected)

#%% plotting
plt.scatter(projected[:, 0], projected[:, 1])
# %%
