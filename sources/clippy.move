module clippy::clippy;

use std::string::String;

public struct Clip has key {
    id: UID,
    owner: address,
    text: String,
}

entry fun create_clip(text: String, ctx: &mut TxContext) {
    let id = object::new(ctx);
    let clip = Clip {
        id: id,
        owner: ctx.sender(),
        text: text,
    };
    transfer::share_object(clip);
}

entry fun get_clip(clip: &Clip): String {
    let text = clip.text;
    text
}

entry fun delete_clip(clip: Clip, ctx: &TxContext) {
    assert!(clip.owner == ctx.sender(), 401);
    let Clip { id, .. } = clip;
    object::delete(id)
}
