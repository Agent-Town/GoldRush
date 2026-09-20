import json
import sys
from pathlib import Path

import bpy


source, destination, report = map(Path, sys.argv[sys.argv.index("--") + 1 :])

objects = []
for obj in bpy.context.scene.objects:
    entry = {
        "name": obj.name,
        "type": obj.type,
        "location": list(obj.location),
        "dimensions": list(obj.dimensions),
        "hidden_render": obj.hide_render,
    }
    if obj.type == "MESH":
        mesh = obj.data
        entry.update(
            triangles=sum(len(poly.vertices) - 2 for poly in mesh.polygons),
            vertices=len(mesh.vertices),
            polygons=len(mesh.polygons),
            uv_layers=[layer.name for layer in mesh.uv_layers],
            materials=[slot.material.name if slot.material else None for slot in obj.material_slots],
            modifiers=[modifier.type for modifier in obj.modifiers],
        )
    objects.append(entry)

materials = []
for material in bpy.data.materials:
    nodes = []
    if material.use_nodes:
        for node in material.node_tree.nodes:
            item = {"name": node.name, "type": node.bl_idname}
            if node.bl_idname == "ShaderNodeTexImage" and node.image:
                item["image"] = node.image.name
                item["projection"] = node.projection
                item["extension"] = node.extension
                item["interpolation"] = node.interpolation
            if node.bl_idname == "ShaderNodeBsdfPrincipled":
                item["metallic"] = node.inputs["Metallic"].default_value
                item["roughness"] = node.inputs["Roughness"].default_value
            nodes.append(item)
        links = [
            f"{link.from_node.name}.{link.from_socket.name} -> {link.to_node.name}.{link.to_socket.name}"
            for link in material.node_tree.links
        ]
    else:
        links = []
    materials.append({"name": material.name, "nodes": nodes, "links": links})

images = [
    {
        "name": image.name,
        "size": list(image.size),
        "packed": image.packed_file is not None,
        "source": image.source,
        "colorspace": image.colorspace_settings.name,
    }
    for image in bpy.data.images
]

destination.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(destination),
    export_format="GLB",
    export_apply=True,
    export_cameras=False,
    export_lights=False,
)

report.write_text(
    json.dumps(
        {
            "blender": bpy.app.version_string,
            "source": str(source),
            "destination": str(destination),
            "objects": objects,
            "materials": materials,
            "images": images,
        },
        indent=2,
    )
    + "\n"
)
