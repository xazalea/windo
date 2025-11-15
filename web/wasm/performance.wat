;; WebAssembly module for performance-critical operations
;; Optimized CPU emulation helpers

(module
  ;; Memory
  (memory (export "memory") 1)
  
  ;; Fast memory copy
  (func $fast_memcpy (param $dst i32) (param $src i32) (param $len i32)
    (local $i i32)
    (local.set $i (i32.const 0))
    (loop $loop
      (if (i32.lt_u (local.get $i) (local.get $len))
        (then
          (i32.store8
            (i32.add (local.get $dst) (local.get $i))
            (i32.load8_u (i32.add (local.get $src) (local.get $i)))
          )
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $loop)
        )
      )
    )
  )
  
  ;; Fast memory fill
  (func $fast_memset (param $dst i32) (param $value i32) (param $len i32)
    (local $i i32)
    (local.set $i (i32.const 0))
    (loop $loop
      (if (i32.lt_u (local.get $i) (local.get $len))
        (then
          (i32.store8
            (i32.add (local.get $dst) (local.get $i))
            (local.get $value)
          )
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $loop)
        )
      )
    )
  )
  
  ;; Optimized pixel buffer operations
  (func $blit_pixels (param $dst i32) (param $src i32) (param $width i32) (param $height i32)
    (local $y i32)
    (local $x i32)
    (local $offset i32)
    
    (local.set $y (i32.const 0))
    (loop $y_loop
      (if (i32.lt_u (local.get $y) (local.get $height))
        (then
          (local.set $x (i32.const 0))
          (loop $x_loop
            (if (i32.lt_u (local.get $x) (local.get $width))
              (then
                (local.set $offset
                  (i32.add
                    (i32.mul (local.get $y) (local.get $width))
                    (local.get $x)
                  )
                )
                (i32.store8
                  (i32.add (local.get $dst) (local.get $offset))
                  (i32.load8_u (i32.add (local.get $src) (local.get $offset)))
                )
                (local.set $x (i32.add (local.get $x) (i32.const 1)))
                (br $x_loop)
              )
            )
          )
          (local.set $y (i32.add (local.get $y) (i32.const 1)))
          (br $y_loop)
        )
      )
    )
  )
  
  (export "fast_memcpy" (func $fast_memcpy))
  (export "fast_memset" (func $fast_memset))
  (export "blit_pixels" (func $blit_pixels))
)

