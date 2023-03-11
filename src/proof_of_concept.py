#%%

"""
    cylinder 
      radius r
      height h
      point 000 in center of cylinder, on half height
"""


import numpy as np

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

# %% Expecting x to be close to one
proj = project(np.array([0.01, 0.0, -1.0]))
assert(proj[0] > 0.99)

# %% Expecting x to be close to -one
proj = project(np.array([-0.01, 0.0, -1.0]))
assert(proj[0] < -0.99)

# %%
