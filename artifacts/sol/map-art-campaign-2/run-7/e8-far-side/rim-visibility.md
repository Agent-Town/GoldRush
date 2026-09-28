# Far Side northern rim — inherited hero occlusion

The northern diagnostic viewpoint at **(0, 60.512)** hides most of the hero behind the rendered rim in both baseline and candidate. Both arms report **y = 1.2595017337799068**, walkable = true, and zero errors at both viewport sizes. [Paired phone diagnostic](rim-board-390.png) · [Coordinates and error records](stations-paired.json). The newly selected listening post is visible beside the retained Earthrise array; the hero occlusion already occurs without that post.

This remains **HELD by terrain presentation/camera ownership**. No height, mask, parent geometry or camera change is authorized here. This is a visual limitation at a remote diagnostic point, not the ordinary spawn; the natural spawn is walkable and all composed-blocker face/escape tests pass. The four ordinary boot captures remain separate and contain no debug hook.

Two registry-authorized composed groups exist: west-comms-shadow-marker beside lava-tube-survey-gantry; far-horizon-listening-post at the Earthrise array. Both parents are retained, and the probe uses each connected blocker group’s outer faces.
