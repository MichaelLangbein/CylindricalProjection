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

def createBox(x, y, z, width, height, depth):
    # far wall
    a = [x-width/2, y+height/2, z+depth/2]
    b = [x+width/2, y+height/2, z+depth/2]
    c = [x+width/2, y-height/2, z+depth/2]
    d = [x-width/2, y-height/2, z+depth/2]
    # near wall
    e = [x-width/2, y+height/2, z-depth/2]
    f = [x+width/2, y+height/2, z-depth/2]
    g = [x+width/2, y-height/2, z-depth/2]
    h = [x-width/2, y-height/2, z-depth/2]

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
    return samples

def projectAll(points):
    projected = []
    for point in points:
        projected.append(project(point))
    projected = np.array(projected)
    return projected

#%% projecting samples
samplesRoom = createBox(0, 0, 0, 2, 1, 4)
roomProjected = projectAll(samplesRoom)
samplesBox = createBox(0.5, 0.0, 0.5, 0.2, 0.2, 0.2)
boxProjected = projectAll(samplesBox)


#%% plotting
plt.scatter(roomProjected[:, 0], roomProjected[:, 1])
plt.scatter(boxProjected[:, 0], boxProjected[:, 1])
# %%
